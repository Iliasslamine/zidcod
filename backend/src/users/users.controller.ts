import { Controller, Post, Body, Get, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Post('seed-admin')
  seedAdmin() {
    const adminDto: CreateUserDto = {
      email: 'admin@zidcod.com',
      password: 'admin123',
      role: Role.ADMIN,
    };
    return this.usersService.createUser(adminDto);
  }

  @Post('seed-seller')
  seedSeller() {
    const sellerDto: CreateUserDto = {
      email: 'seller@zidcod.com',
      password: 'seller123',
      role: Role.SELLER,
    };
    return this.usersService.createUser(sellerDto);
  }

  @Get('sellers')
  getSellers() {
    return this.usersService.findAllSellers();
  }

  @Get('profile')
  getProfile(@Query('identifier') identifier?: string) {
    return this.usersService.getSellerProfile(identifier);
  }

  @Put('profile')
  updateProfile(
    @Body() body: { identifier?: string; fullName?: string; storeName?: string; contact?: string; city?: string },
  ) {
    const identifier = body.identifier || 'ilyasslamine@gmail.com';
    return this.usersService.updateSellerProfile(identifier, body);
  }

  @Put('bank')
  updateBank(
    @Body() body: { identifier?: string; bankName: string; rib: string },
  ) {
    const identifier = body.identifier || 'ilyasslamine@gmail.com';
    return this.usersService.updateSellerBank(identifier, body);
  }

  @Put('security')
  updateSecurity(
    @Body() body: { identifier?: string; currentPassword?: string; newPassword: string },
  ) {
    const identifier = body.identifier || 'ilyasslamine@gmail.com';
    return this.usersService.updateSellerSecurity(identifier, body);
  }
}

