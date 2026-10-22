import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { LedgerModule } from '../ledger/ledger.module.js';

@Module({
  imports: [PrismaModule, LedgerModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
