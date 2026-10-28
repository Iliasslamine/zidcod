import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { RequestProductDto } from './dto/request-product.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    // In a real app we'd check if user.role === 'ADMIN' here
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('marketplace')
  findAllMarketplace(@Request() req: any) {
    return this.productsService.findAllMarketplace(req.user?.sub);
  }

  @Get('my')
  findSellerProducts(@Request() req: any) {
    return this.productsService.findSellerProducts(req.user.sub);
  }

  @Get('requests/all')
  findAllRequests() {
    return this.productsService.findAllRequests();
  }

  @Patch('requests/:id')
  updateRequestStatus(@Param('id') id: string, @Body('status') status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.productsService.updateRequestStatus(id, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.productsService.findOne(id, req.user?.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/request')
  requestAccess(
    @Param('id') id: string,
    @Body() dto: RequestProductDto,
    @Request() req: any
  ) {
    return this.productsService.requestAccess(id, req.user.sub, dto);
  }

  @Post(':id/request-access')
  requestAccessDirect(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body?: { minimumPrice?: number }
  ) {
    return this.productsService.requestAccessDirect(id, req.user.sub, body?.minimumPrice);
  }
}
