import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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

  async createBulkLeads(userId: string, leads: any[]) {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) throw new NotFoundException('Seller profile not found');

    if (!Array.isArray(leads) || leads.length === 0) {
      throw new BadRequestException('No leads provided');
    }

    const products = await this.prisma.product.findMany();
    const productSkuMap = new Map<string, any>();
    const productNameMap = new Map<string, any>();
    for (const p of products) {
      if (p.sku) productSkuMap.set(p.sku.toLowerCase().trim(), p);
      if (p.name) productNameMap.set(p.name.toLowerCase().trim(), p);
    }

    const createdOrders: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < leads.length; i++) {
      const row = leads[i];
      const rawSku = String(row.sku || row.productSku || row['Product SKU'] || '').trim();
      const customer = String(row.customerName || row.customer || row.name || row['Customer Name'] || '').trim();
      const phone = String(row.phone || row.phoneNumber || row['Phone Number'] || '').trim();
      const city = String(row.city || row['City'] || 'Casablanca').trim();
      const address = String(row.address || row.fullAddress || row['Full Address'] || '').trim();
      const rawPriceStr = String(row.price ?? row['Price'] ?? '').replace(/[^\d.]/g, '');
      const price = parseFloat(rawPriceStr) || 0;
      const quantity = parseInt(String(row.quantity ?? row['Quantity'] ?? '1').replace(/[^\d]/g, ''), 10) || 1;
      const notes = String(row.notes || row.note || row['Notes'] || '').trim();

      if (!customer || !phone) {
        errors.push({ row: i + 1, error: 'Customer name or phone is missing' });
        continue;
      }

      // Match product by SKU or name
      let product = productSkuMap.get(rawSku.toLowerCase()) || productNameMap.get(rawSku.toLowerCase());
      if (!product && rawSku) {
        product = products.find(p => 
          (p.sku && p.sku.toLowerCase() === rawSku.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(rawSku.toLowerCase())) || 
          (p.name && p.name.toLowerCase().includes(rawSku.toLowerCase()))
        );
      }

      if (!product) {
        if (products.length > 0) {
          product = products[0];
        } else {
          errors.push({ row: i + 1, error: `Product SKU '${rawSku}' not found in catalog` });
          continue;
        }
      }

      // Ensure seller has an offer for this product so it displays properly everywhere
      const existingOffer = await this.prisma.sellerProductOffer.findUnique({
        where: {
          sellerId_productId: {
            sellerId: seller.id,
            productId: product.id,
          }
        }
      });
      if (!existingOffer) {
        await this.prisma.sellerProductOffer.create({
          data: {
            sellerId: seller.id,
            productId: product.id,
            minimumPrice: product.sellingPrice || 50,
            approvedStatus: 'APPROVED',
          }
        });
      }

      const unitPrice = price > 0 ? price : (product.sellingPrice || 100);
      const totalPrice = unitPrice * quantity;

      const order = await this.prisma.order.create({
        data: {
          sellerId: seller.id,
          productId: product.id,
          totalPrice,
          customerInfo: {
            name: customer,
            phone,
            city: city || 'Casablanca',
            address: address || '',
            notes: notes || '',
            quantity,
            sku: product.sku || rawSku,
            source: 'CSV_IMPORT'
          },
          status: OrderStatus.NEW,
        }
      });
      createdOrders.push(order);
    }

    return {
      success: true,
      count: createdOrders.length,
      errorsCount: errors.length,
      errors
    };
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

  async deleteOrder(userId: string, role: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (role !== 'ADMIN' && order.seller.userId !== userId) {
      throw new ForbiddenException('You cannot delete this order');
    }

    await this.prisma.ledgerEntry.deleteMany({ where: { orderId } });
    await this.prisma.order.delete({ where: { id: orderId } });

    return { success: true, message: 'Order deleted successfully' };
  }

  async deleteAllOrders(userId: string, role: string) {
    if (role === 'ADMIN') {
      await this.prisma.ledgerEntry.deleteMany({ where: { orderId: { not: null } } });
      const res = await this.prisma.order.deleteMany({});
      return { success: true, count: res.count };
    } else {
      const seller = await this.prisma.seller.findUnique({ where: { userId } });
      if (!seller) throw new NotFoundException('Seller profile not found');
      await this.prisma.ledgerEntry.deleteMany({ where: { sellerId: seller.id, orderId: { not: null } } });
      const res = await this.prisma.order.deleteMany({ where: { sellerId: seller.id } });
      return { success: true, count: res.count };
    }
  }
}
