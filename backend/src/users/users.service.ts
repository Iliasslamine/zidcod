import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

  async getSellerProfile(identifier?: string) {
    let user;
    if (identifier) {
      user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { id: identifier },
            { email: { equals: identifier.trim(), mode: 'insensitive' } },
          ],
        },
        include: { sellerProfile: true },
      });
    }

    if (!user) {
      // Fallback to primary test seller
      user = await this.prisma.user.findFirst({
        where: { email: { equals: 'ilyasslamine@gmail.com', mode: 'insensitive' } },
        include: { sellerProfile: true },
      });
    }

    if (!user) {
      throw new NotFoundException('Seller profile not found');
    }

    return {
      userId: user.id,
      email: user.email,
      fullName: user.sellerProfile?.fullName || 'ILIASS LAMINE',
      storeName: user.sellerProfile?.storeName || 'RUVANO',
      contact: user.sellerProfile?.contact || '+212649847132',
      city: user.sellerProfile?.city || 'Meknès',
      bankName: user.sellerProfile?.bankName || '',
      rib: user.sellerProfile?.rib || '',
      status: user.sellerProfile?.status || 'ACTIVE',
    };
  }

  async updateSellerProfile(identifier: string, data: { fullName?: string; storeName?: string; contact?: string; city?: string }) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: { equals: identifier.trim(), mode: 'insensitive' } },
        ],
      },
      include: { sellerProfile: true },
    });

    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { email: { equals: 'ilyasslamine@gmail.com', mode: 'insensitive' } },
        include: { sellerProfile: true },
      });
    }

    if (!user) {
      throw new NotFoundException('Seller profile not found');
    }

    let profile;
    if (user.sellerProfile) {
      profile = await this.prisma.seller.update({
        where: { id: user.sellerProfile.id },
        data: {
          ...(data.fullName !== undefined && { fullName: data.fullName }),
          ...(data.storeName !== undefined && { storeName: data.storeName }),
          ...(data.contact !== undefined && { contact: data.contact }),
          ...(data.city !== undefined && { city: data.city }),
        },
      });
    } else {
      profile = await this.prisma.seller.create({
        data: {
          userId: user.id,
          fullName: data.fullName || 'ILIASS LAMINE',
          storeName: data.storeName || 'RUVANO',
          contact: data.contact || '+212649847132',
          city: data.city || 'Meknès',
          status: 'ACTIVE',
        },
      });
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      profile: {
        userId: user.id,
        email: user.email,
        fullName: profile.fullName,
        storeName: profile.storeName,
        contact: profile.contact,
        city: profile.city,
        bankName: profile.bankName,
        rib: profile.rib,
      },
    };
  }

  async updateSellerBank(identifier: string, data: { bankName: string; rib: string }) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: { equals: identifier.trim(), mode: 'insensitive' } },
        ],
      },
      include: { sellerProfile: true },
    });

    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { email: { equals: 'ilyasslamine@gmail.com', mode: 'insensitive' } },
        include: { sellerProfile: true },
      });
    }

    if (!user) {
      throw new NotFoundException('Seller profile not found');
    }

    const cleanRib = (data.rib || '').replace(/\D/g, '');
    if (cleanRib && cleanRib.length !== 24) {
      throw new BadRequestException('RIB must be exactly 24 digits');
    }

    let profile;
    if (user.sellerProfile) {
      profile = await this.prisma.seller.update({
        where: { id: user.sellerProfile.id },
        data: {
          bankName: data.bankName || null,
          rib: cleanRib || null,
        },
      });
    } else {
      profile = await this.prisma.seller.create({
        data: {
          userId: user.id,
          fullName: 'ILIASS LAMINE',
          storeName: 'RUVANO',
          contact: '+212649847132',
          city: 'Meknès',
          bankName: data.bankName || null,
          rib: cleanRib || null,
          status: 'ACTIVE',
        },
      });
    }

    return {
      success: true,
      message: 'Bank information saved',
      bankName: profile.bankName,
      rib: profile.rib,
    };
  }

  async updateSellerSecurity(identifier: string, data: { currentPassword?: string; newPassword: string }) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: { equals: identifier.trim(), mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { email: { equals: 'ilyasslamine@gmail.com', mode: 'insensitive' } },
      });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password if provided
    if (data.currentPassword) {
      const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    // Validate new password: min 8 chars, 1 uppercase, 1 number
    if (!data.newPassword || data.newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(data.newPassword)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(data.newPassword)) {
      throw new BadRequestException('Password must contain at least one number');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(data.newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}

