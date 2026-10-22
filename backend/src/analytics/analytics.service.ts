import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminAnalytics() {
    const totalOrders = await this.prisma.order.count();
    
    const revenueObj = await this.prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: OrderStatus.DELIVERED }
    });
    
    const deliveredCount = await this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } });
    const confirmedCount = await this.prisma.order.count({ 
      where: { 
        status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } 
      } 
    });

    return {
      totalLeads: totalOrders,
      confirmed: confirmedCount,
      delivered: deliveredCount,
      revenue: revenueObj._sum.totalPrice || 0,
    };
  }

  async getSellerAnalytics(userId: string) {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) return { totalLeads: 0, confirmed: 0, delivered: 0, revenue: 0 };

    const sellerId = seller.id;

    const totalOrders = await this.prisma.order.count({ where: { sellerId } });
    
    const revenueObj = await this.prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { sellerId, status: OrderStatus.DELIVERED }
    });
    
    const deliveredCount = await this.prisma.order.count({ where: { sellerId, status: OrderStatus.DELIVERED } });
    const confirmedCount = await this.prisma.order.count({ 
      where: { 
        sellerId, 
        status: { in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } 
      } 
    });

    return {
      totalLeads: totalOrders,
      confirmed: confirmedCount,
      delivered: deliveredCount,
      revenue: revenueObj._sum.totalPrice || 0,
    };
  }
}
