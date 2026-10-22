import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePackDto } from './dto/create-pack.dto.js';

@Injectable()
export class PacksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePackDto) {
    let seller = await this.prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      seller = await this.prisma.seller.findFirst();
      if (!seller) {
        throw new NotFoundException('No seller found to associate this pack with');
      }
    }

    return this.prisma.pack.create({
      data: {
        sellerId: seller.id,
        name: dto.name,
        description: dto.description || null,
        minimumPrice: dto.minimumPrice,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        items: {
          create: dto.items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity || 1,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findAll(userId?: string) {
    let sellerId: string | undefined;
    if (userId) {
      const seller = await this.prisma.seller.findUnique({ where: { userId } });
      if (seller) {
        sellerId = seller.id;
      }
    }

    return this.prisma.pack.findMany({
      where: sellerId ? { sellerId } : undefined,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        seller: {
          select: {
            id: true,
            storeName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const pack = await this.prisma.pack.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!pack) throw new NotFoundException('Pack not found');
    return pack;
  }

  async remove(id: string) {
    return this.prisma.pack.delete({
      where: { id },
    });
  }
}
