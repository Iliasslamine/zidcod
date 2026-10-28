import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LedgerEntryType, LedgerEntryStatus } from '@prisma/client';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async generateDeliverySplit(orderId: string, sellerId: string, totalPrice: number, adminCosts: number) {
    const sellerCommission = totalPrice - adminCosts;

    await this.prisma.ledgerEntry.createMany({
      data: [
        {
          orderId,
          sellerId,
          type: LedgerEntryType.SELLER_COMMISSION,
          amount: sellerCommission,
          status: LedgerEntryStatus.AVAILABLE,
        },
        {
          orderId,
          sellerId,
          type: LedgerEntryType.DELIVERY_FEE,
          amount: adminCosts * 0.4, 
          status: LedgerEntryStatus.AVAILABLE,
        },
        {
          orderId,
          sellerId,
          type: LedgerEntryType.SERVICE_FEE,
          amount: adminCosts * 0.6, 
          status: LedgerEntryStatus.AVAILABLE,
        }
      ]
    });
  }

  async getWallet(userId: string) {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) return { AVAILABLE: 0, PENDING_PAYOUT: 0, PAID: 0 };

    const sellerId = seller.id;

    const available = await this.prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { sellerId, status: LedgerEntryStatus.AVAILABLE, type: LedgerEntryType.SELLER_COMMISSION }
    });
    
    const pending = await this.prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { sellerId, status: LedgerEntryStatus.PENDING_PAYOUT, type: LedgerEntryType.SELLER_COMMISSION }
    });

    const paid = await this.prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { sellerId, status: LedgerEntryStatus.PAID, type: LedgerEntryType.SELLER_COMMISSION }
    });

    return {
      available: available._sum.amount || 0,
      pendingPayout: pending._sum.amount || 0,
      paid: paid._sum.amount || 0,
      rib: seller.rib || null,
      bankName: seller.bankName || null,
    };
  }

  async requestPayout(userId: string) {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) throw new NotFoundException('Seller not found');

    const cleanRib = (seller.rib || '').replace(/\D/g, '');
    if (!cleanRib || cleanRib.length !== 24) {
      throw new BadRequestException('Please add your 24-digit Bank RIB in Settings before requesting a payout.');
    }

    const available = await this.prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { sellerId: seller.id, status: LedgerEntryStatus.AVAILABLE, type: LedgerEntryType.SELLER_COMMISSION }
    });

    const balance = available._sum.amount || 0;
    if (balance <= 0) {
      throw new BadRequestException('Insufficient balance to request a payout.');
    }

    return this.prisma.ledgerEntry.updateMany({
      where: {
        sellerId: seller.id,
        status: LedgerEntryStatus.AVAILABLE,
        type: LedgerEntryType.SELLER_COMMISSION
      },
      data: {
        status: LedgerEntryStatus.PENDING_PAYOUT
      }
    });
  }

  async approvePayout(sellerId: string) {
    return this.prisma.ledgerEntry.updateMany({
      where: {
        sellerId,
        status: LedgerEntryStatus.PENDING_PAYOUT,
        type: LedgerEntryType.SELLER_COMMISSION
      },
      data: {
        status: LedgerEntryStatus.PAID
      }
    });
  }

  async getAllPayoutRequests() {
    const pendingEntries = await this.prisma.ledgerEntry.findMany({
      where: {
        status: LedgerEntryStatus.PENDING_PAYOUT,
        type: LedgerEntryType.SELLER_COMMISSION
      },
      include: {
        seller: true
      }
    });

    const grouped = pendingEntries.reduce((acc, entry) => {
      if (!acc[entry.sellerId]) {
        acc[entry.sellerId] = {
          id: entry.sellerId, // use sellerId as id for the action
          seller: entry.seller.storeName,
          amount: 0,
          date: entry.createdAt.toISOString().split('T')[0],
          status: entry.status
        };
      }
      acc[entry.sellerId].amount += entry.amount;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }
}
