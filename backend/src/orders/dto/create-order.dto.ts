import { IsString, IsNumber, Min, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  productId!: string;

  @IsNumber()
  @Min(0)
  totalPrice!: number;

  @IsObject()
  customerInfo!: Record<string, any>;
}
