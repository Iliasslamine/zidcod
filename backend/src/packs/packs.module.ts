import { Module } from '@nestjs/common';
import { PacksController } from './packs.controller.js';
import { PacksService } from './packs.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PacksController],
  providers: [PacksService],
  exports: [PacksService],
})
export class PacksModule {}
