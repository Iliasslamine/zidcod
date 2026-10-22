import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
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
}
