import { Controller, Get, Post, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { LedgerService } from './ledger.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('wallet')
  getWallet(@Request() req: any) {
    return this.ledgerService.getWallet(req.user.sub);
  }

  @Post('request-payout')
  requestPayout(@Request() req: any) {
    return this.ledgerService.requestPayout(req.user.sub);
  }

  @Patch('approve-payout/:sellerId')
  approvePayout(@Param('sellerId') sellerId: string) {
    // Should be admin only
    return this.ledgerService.approvePayout(sellerId);
  }

  @Get('payout-requests')
  getAllPayoutRequests() {
    // Should be admin only
    return this.ledgerService.getAllPayoutRequests();
  }
}
