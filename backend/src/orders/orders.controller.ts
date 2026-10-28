import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { BulkCreateOrderDto } from './dto/bulk-create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createLead(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.createLead(req.user.sub, dto);
  }

  @Post('bulk')
  createBulkLeads(@Body() dto: BulkCreateOrderDto, @Request() req: any) {
    return this.ordersService.createBulkLeads(req.user.sub, dto.leads);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Get('admin')
  findAllAdmin() {
    return this.ordersService.findAllAdmin();
  }

  @Post('youcan/import')
  importYouCan(@Body() dto: { token: string, productId: string }, @Request() req: any) {
    return this.ordersService.importYouCanOrders(req.user.sub, dto.token, dto.productId);
  }

  @Get('seller')
  findAllSeller(@Request() req: any) {
    return this.ordersService.findAllSeller(req.user.sub);
  }

  @Delete(':id')
  deleteOrder(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.deleteOrder(req.user.sub, req.user.role, id);
  }

  @Post('bulk-delete')
  deleteBatchOrders(@Body('orderIds') orderIds: string[], @Request() req: any) {
    return this.ordersService.deleteBatchOrders(req.user.sub, req.user.role, orderIds);
  }

  @Delete()
  deleteAllOrders(@Request() req: any) {
    return this.ordersService.deleteAllOrders(req.user.sub, req.user.role);
  }
}
