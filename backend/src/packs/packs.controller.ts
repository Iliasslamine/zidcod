import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PacksService } from './packs.service.js';
import { CreatePackDto } from './dto/create-pack.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('packs')
export class PacksController {
  constructor(private readonly packsService: PacksService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreatePackDto) {
    return this.packsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.packsService.findAll(req.user.role === 'ADMIN' ? undefined : req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packsService.remove(id);
  }
}
