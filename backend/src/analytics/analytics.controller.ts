import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin')
  getAdminAnalytics() {
    return this.analyticsService.getAdminAnalytics();
  }

  @Get('seller')
  getSellerAnalytics(@Request() req: any) {
    return this.analyticsService.getSellerAnalytics(req.user.sub);
  }
}
