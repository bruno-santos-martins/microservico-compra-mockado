import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  cbdPercentage!: number;

  @IsNumber()
  @Min(0)
  thcPercentage!: number;

  @IsNumber()
  @Min(0)
  stockQuantity!: number;
}

export class ProductListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}

export class CheckoutItemDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}

export class RequestCheckoutDto {
  @IsString()
  customerName!: string;

  @IsEmail()
  customerEmail!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @IsString()
  @IsUrl()
  prescriptionUrl!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount!: number;
}
