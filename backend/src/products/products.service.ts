import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { RequestProductDto } from './dto/request-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });
    if (existing) {
      throw new ConflictException('SKU already exists');
    }
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAllMarketplace(userId?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        stockLevel: { gt: 0 },
        status: 'Published',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!userId) return products;

    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) return products;

    const offers = await this.prisma.sellerProductOffer.findMany({
      where: { sellerId: seller.id }
    });
    const offerMap = new Map(offers.map(o => [o.productId, o]));

    return products.map(p => ({
      ...p,
      sellerOffer: offerMap.get(p.id) || null,
    }));
  }
  
  findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    let sellerOffer = null;
    if (userId) {
      const seller = await this.prisma.seller.findUnique({ where: { userId } });
      if (seller) {
        sellerOffer = await this.prisma.sellerProductOffer.findUnique({
          where: {
            sellerId_productId: {
              sellerId: seller.id,
              productId: id,
            },
          },
        });
      }
    }

    return {
      ...product,
      sellerOffer,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async requestAccess(productId: string, userId: string, dto: RequestProductDto) {
    // Find or create seller profile for the user
    let seller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        seller = await this.prisma.seller.create({
          data: {
            userId: user.id,
            storeName: user.email.split('@')[0].toUpperCase(),
            contact: '+212600000000',
            status: 'ACTIVE',
          },
        });
      } else {
        throw new NotFoundException('User not found');
      }
    }

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const baseCost = product.costPrice ?? product.adminCosts ?? 25;
    const confFee = product.confirmationFee ?? 10;
    const delivFee = product.deliveryFee ?? 32;
    const packFee = product.packagingFee ?? 3;
    const minPrice = product.sellingPrice || (baseCost + confFee + delivFee + packFee);

    if (dto.minimumPrice < minPrice) {
      throw new BadRequestException(`Planned selling price must be at least ${minPrice} DH`);
    }

    const existingOffer = await this.prisma.sellerProductOffer.findUnique({
      where: {
        sellerId_productId: {
          sellerId: seller.id,
          productId,
        },
      },
    });

    if (existingOffer) {
      if (existingOffer.approvedStatus === 'APPROVED') {
        return existingOffer;
      }
      return this.prisma.sellerProductOffer.update({
        where: { id: existingOffer.id },
        data: {
          minimumPrice: dto.minimumPrice,
          approvedStatus: 'PENDING',
        },
      });
    }

    return this.prisma.sellerProductOffer.create({
      data: {
        sellerId: seller.id,
        productId,
        minimumPrice: dto.minimumPrice,
        approvedStatus: 'PENDING',
      },
    });
  }

  findAllRequests() {
    return this.prisma.sellerProductOffer.findMany({
      include: {
        seller: {
          include: { user: true }
        },
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateRequestStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.prisma.sellerProductOffer.update({
      where: { id },
      data: { approvedStatus: status }
    });
  }

  async findSellerProducts(userId: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { userId },
    });
    if (!seller) {
      return [];
    }
    const offers = await this.prisma.sellerProductOffer.findMany({
      where: { sellerId: seller.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
    return offers.map((o) => ({
      ...o.product,
      offerId: o.id,
      offerStatus: o.approvedStatus,
      sellerMinimumPrice: o.minimumPrice,
    }));
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');

    // Clean up relations
    await this.prisma.sellerProductOffer.deleteMany({
      where: { productId: id }
    });
    await this.prisma.packItem.deleteMany({
      where: { productId: id }
    });

    return this.prisma.product.delete({
      where: { id }
    });
  }
}
