import { IsString, IsNumber, Min, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  adminCosts?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockLevel?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  canvaLink?: string;

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  productProfit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  confirmationFee?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deliveryFee?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  packagingFee?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sellingPrice?: number;

  @IsBoolean()
  @IsOptional()
  isWhiteLabel?: boolean;

  @IsString()
  @IsOptional()
  visibility?: string;

  @IsString()
  @IsOptional()
  ownerSellerId?: string;
}
