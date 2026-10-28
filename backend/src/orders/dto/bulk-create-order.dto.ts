import { IsArray } from 'class-validator';

export class BulkCreateOrderDto {
  @IsArray()
  leads!: any[];
}

