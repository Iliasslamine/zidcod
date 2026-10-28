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

    let finalProductId = dto.productId;
    let minAllowedPrice = 0;

    if (dto.productId && dto.productId.startsWith('pack:')) {
      const packId = dto.productId.replace('pack:', '');
      const packRecord = await this.prisma.pack.findUnique({
        where: { id: packId },
        include: { items: { include: { product: true } } }
      });
      if (!packRecord || packRecord.sellerId !== seller.id) {
        throw new BadRequestException('Pack not found or does not belong to your store');
      }
      if (!packRecord.items || packRecord.items.length === 0) {
        throw new BadRequestException('This pack has no products');
      }
      finalProductId = packRecord.items[0].productId;
      minAllowedPrice = packRecord.minimumPrice;

      let hash = 0;
      for (let j = 0; j < packRecord.id.length; j++) {
        hash = (hash << 5) - hash + packRecord.id.charCodeAt(j);
        hash |= 0;
      }
      const packSku = `PACK-${Math.abs(hash % 90000) + 10000}`;

      dto.customerInfo = {
        ...dto.customerInfo,
        isPack: true,
        packId: packRecord.id,
        packName: packRecord.name,
        packSku,
        packItems: packRecord.items.map((it: any) => ({
          productId: it.productId,
          productName: it.product?.name,
          productSku: it.product?.sku,
          productImage: it.product?.imageUrl || it.product?.image,
          quantity: it.quantity
        }))
      };
    } else {
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
      minAllowedPrice = offer.minimumPrice;
    }

    if (dto.totalPrice < minAllowedPrice) {
      throw new BadRequestException(`Total price must be at least ${minAllowedPrice} DH`);
    }

    return this.prisma.order.create({
      data: {
        sellerId: seller.id,
        productId: finalProductId,
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

    const sellerPacks = await this.prisma.pack.findMany({
      where: { sellerId: seller.id },
      include: { items: { include: { product: true } } }
    });

    const packSkuMap = new Map<string, any>();
    for (const pk of sellerPacks) {
      let hash = 0;
      for (let j = 0; j < pk.id.length; j++) {
        hash = (hash << 5) - hash + pk.id.charCodeAt(j);
        hash |= 0;
      }
      const pkSku = `PACK-${Math.abs(hash % 90000) + 10000}`;
      packSkuMap.set(pkSku.toLowerCase(), { ...pk, computedSku: pkSku });
      packSkuMap.set(pk.name.toLowerCase().trim(), { ...pk, computedSku: pkSku });
      packSkuMap.set(pk.id.toLowerCase(), { ...pk, computedSku: pkSku });
    }

    const createdOrders: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < leads.length; i++) {
      const row = leads[i];
      const rawSku = String(row.sku || row.productSku || row['Product SKU'] || row['SKU'] || '').trim();
      const customer = String(row.customerName || row.customer || row.name || row['Customer Name'] || row['Customer'] || '').trim();
      const phone = String(row.phone || row.phoneNumber || row['Phone Number'] || '').trim();
      const city = String(row.city || row['City'] || 'Casablanca').trim();
      const address = String(row.address || row.fullAddress || row['Full Address'] || row['Address'] || '').trim();
      const rawPriceStr = String(row.price ?? row['Price'] ?? '').replace(/[^\d.]/g, '');
      const price = parseFloat(rawPriceStr) || 0;
      const quantity = parseInt(String(row.quantity ?? row['Quantity'] ?? row['Qty'] ?? '1').replace(/[^\d]/g, ''), 10) || 1;
      const notes = String(row.notes || row.note || row['Notes'] || row['Note'] || '').trim();

      if (!customer || !phone) {
        errors.push({ row: i + 1, error: 'Customer name or phone is missing' });
        continue;
      }

      // Check if SKU matches a Pack
      const matchedPack = packSkuMap.get(rawSku.toLowerCase()) || 
        (row.productId && row.productId.startsWith('pack:') ? packSkuMap.get(row.productId.replace('pack:', '').toLowerCase()) : null);

      if (matchedPack) {
        if (!matchedPack.items || matchedPack.items.length === 0) {
          errors.push({ row: i + 1, error: `Pack '${matchedPack.name}' has no products inside.` });
          continue;
        }

        const packMinPrice = matchedPack.minimumPrice;
        const totalOrderPrice = price > 0 ? price : packMinPrice;

        if (totalOrderPrice < packMinPrice) {
          errors.push({ row: i + 1, error: `Price (${totalOrderPrice} DH) is below pack minimum (${packMinPrice} DH)` });
          continue;
        }

        const order = await this.prisma.order.create({
          data: {
            sellerId: seller.id,
            productId: matchedPack.items[0].productId,
            totalPrice: totalOrderPrice,
            customerInfo: {
              name: customer,
              phone,
              city: city || 'Casablanca',
              address: address || '',
              notes: notes || '',
              quantity: 1,
              isPack: true,
              packId: matchedPack.id,
              packName: matchedPack.name,
              packSku: matchedPack.computedSku,
              packItems: matchedPack.items.map((it: any) => ({
                productId: it.productId,
                productName: it.product?.name,
                productSku: it.product?.sku,
                productImage: it.product?.imageUrl || it.product?.image,
                quantity: it.quantity
              })),
              source: 'CSV_IMPORT'
            },
            status: OrderStatus.NEW,
          }
        });
        createdOrders.push(order);
        continue;
      }

      // Otherwise match product by SKU or name
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

  async deleteBatchOrders(userId: string, role: string, orderIds: string[]) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new BadRequestException('No order IDs provided');
    }

    if (role === 'ADMIN') {
      await this.prisma.ledgerEntry.deleteMany({ where: { orderId: { in: orderIds } } });
      const res = await this.prisma.order.deleteMany({ where: { id: { in: orderIds } } });
      return { success: true, count: res.count };
    } else {
      const seller = await this.prisma.seller.findUnique({ where: { userId } });
      if (!seller) throw new NotFoundException('Seller profile not found');
      await this.prisma.ledgerEntry.deleteMany({ where: { sellerId: seller.id, orderId: { in: orderIds } } });
      const res = await this.prisma.order.deleteMany({
        where: { id: { in: orderIds }, sellerId: seller.id }
      });
      return { success: true, count: res.count };
    }
  }
}
