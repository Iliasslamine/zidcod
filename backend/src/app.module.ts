import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { LedgerModule } from './ledger/ledger.module.js';
import { ProductsModule } from './products/products.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { IntegrationsModule } from './integrations/integrations.module.js';
import { PacksModule } from './packs/packs.module.js';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, OrdersModule, LedgerModule, ProductsModule, AnalyticsModule, IntegrationsModule, PacksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
