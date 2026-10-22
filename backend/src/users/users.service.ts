import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const role = dto.role || Role.SELLER;

    // Use Prisma nested create if role is SELLER
    if (role === Role.SELLER) {
      return this.prisma.user.create({
        data: {
          email,
          passwordHash,
          role,
          sellerProfile: {
            create: {
              fullName: dto.fullName || null,
              storeName: dto.storeName || dto.fullName || 'My Store',
              contact: dto.contact || '',
              city: dto.city || null,
              bankName: dto.bankName || null,
              rib: dto.rib || null,
              status: 'PENDING',
            },
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          sellerProfile: true,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findAllSellers() {
    return this.prisma.user.findMany({
      where: { role: Role.SELLER },
      include: {
        sellerProfile: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
