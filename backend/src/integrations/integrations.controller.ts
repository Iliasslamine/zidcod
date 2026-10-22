import { Controller, Get, Post, Delete, Body, Query, UseGuards, Request } from '@nestjs/common';
import { IntegrationsService } from './integrations.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('youcan/oauth-url')
  getOauthUrl(@Query('redirect_uri') redirectUri: string) {
    return this.integrationsService.generateYouCanOauthUrl(redirectUri);
  }

  @UseGuards(JwtAuthGuard)
  @Post('youcan/exchange')
  exchangeCode(
    @Request() req: any, 
    @Body() dto: { code: string; state: string; redirect_uri: string }
  ) {
    return this.integrationsService.exchangeYouCanCode(
      req.user.sub,
      dto.code,
      dto.state,
      dto.redirect_uri
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/stores')
  getAdminStores() {
    return this.integrationsService.getConnectedStoresAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/disconnect/:id')
  disconnectAdminStore(@Request() req: any) {
    const id = req.params?.id;
    return this.integrationsService.disconnectStore(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('seller/status')
  getSellerStatus(@Request() req: any) {
    return this.integrationsService.getSellerStatus(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('seller/disconnect')
  disconnectSeller(@Request() req: any) {
    return this.integrationsService.disconnectSellerStore(req.user.sub);
  }

  // Google Sheets Endpoints
  @UseGuards(JwtAuthGuard)
  @Get('seller/sheets-token')
  getSellerSheetToken(@Request() req: any) {
    return this.integrationsService.getSellerSheetToken(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('seller/sheets-token')
  rotateSellerSheetToken(@Request() req: any) {
    return this.integrationsService.rotateSellerSheetToken(req.user.sub);
  }

  @Post('seller/sheets-token/test')
  testSellerSheetToken(@Body('token') token?: string, @Request() req?: any) {
    return this.integrationsService.testSellerSheetToken(token, req?.user?.sub);
  }

  @Post('seller/sheets-sync')
  syncSheetLead(@Body() body: { token: string; row: any[] }) {
    return this.integrationsService.syncSheetLead(body.token, body.row);
  }
}

