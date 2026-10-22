import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LedgerService } from '../ledger/ledger.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService
  ) {}

  async createLead(userId: string, dto: CreateOrderDto) {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const offer = await this.prisma.sellerProductOffer.findUnique({
      where: {
        sellerId_productId: {
          sellerId: seller.id,
          productId: dto.productId
        }
      }
    });

    if (!offer || offer.approvedStatus !== 'APPROVED') {
      throw new BadRequestException('You are not approved to sell this product.');
    }

    if (dto.totalPrice < offer.minimumPrice) {
      throw new BadRequestException(`Total price must be at least ${offer.minimumPrice}`);
    }

    return this.prisma.order.create({
      data: {
        sellerId: seller.id,
        productId: dto.productId,
        customerInfo: dto.customerInfo,
        totalPrice: dto.totalPrice,
        status: OrderStatus.NEW,
      }
    });
  }

  async updateStatus(id: string, newStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({ 
      where: { id }, 
      include: { product: true } 
    });
    
    if (!order) throw new NotFoundException('Order not found');

    const oldStatus = order.status;
    if (newStatus === oldStatus) return order;

    // Process State Machine Actions
    if (newStatus === OrderStatus.SHIPPED) {
      if (order.product.stockLevel < 1) {
        throw new BadRequestException('Insufficient stock to ship this order');
      }
      await this.prisma.product.update({
        where: { id: order.productId },
        data: { stockLevel: { decrement: 1 } },
      });
    }

    if (newStatus === OrderStatus.DELIVERED) {
      await this.ledgerService.generateDeliverySplit(
        order.id, 
        order.sellerId, 
        order.totalPrice, 
        order.product.adminCosts
      );
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async importYouCanOrders(userId: string, token: string, productId: string) {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    const offer = await this.prisma.sellerProductOffer.findUnique({
      where: { sellerId_productId: { sellerId: seller.id, productId } }
    });

    if (!offer || offer.approvedStatus !== 'APPROVED') {
      throw new BadRequestException('You are not approved to sell this product.');
    }

    try {
      const res = await fetch('https://api.youcan.shop/orders?include=customer,variants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch from YouCan API');
      
      const json = await res.json() as any;
      const orders = json.data;

      let successCount = 0;
      let failCount = 0;

      for (const youcanOrder of orders) {
        try {
          const price = youcanOrder.total || 0;
          if (price < offer.minimumPrice) {
            failCount++;
            continue;
          }

          await this.prisma.order.create({
            data: {
              sellerId: seller.id,
              productId,
              customerInfo: {
                name: youcanOrder.customer?.first_name ? `${youcanOrder.customer.first_name} ${youcanOrder.customer.last_name || ''}` : 'Unknown',
                phone: youcanOrder.customer?.phone || '',
                city: youcanOrder.customer?.city || '',
                address: youcanOrder.customer?.address1 || '',
                qty: youcanOrder.variants?.[0]?.quantity || 1,
                note: youcanOrder.note || 'Imported from YouCan'
              },
              totalPrice: price,
              status: OrderStatus.NEW,
            }
          });
          successCount++;
        } catch(e) {
          failCount++;
        }
      }
      return { successCount, failCount };
    } catch (e: any) {
      throw new BadRequestException(e.message || 'Error communicating with YouCan');
    }
  }

  findAllAdmin() {
    return this.prisma.order.findMany({
      include: { product: true, seller: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  findAllSeller(userId: string) {
    return this.prisma.order.findMany({
      where: { seller: { userId } },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
