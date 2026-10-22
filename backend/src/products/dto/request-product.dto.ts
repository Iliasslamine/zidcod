import { IsNumber, Min } from 'class-validator';

export class RequestProductDto {
  @IsNumber()
  @Min(0)
  minimumPrice!: number;
}
