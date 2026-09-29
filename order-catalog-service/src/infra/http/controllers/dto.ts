import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'Cannabis Oil 30ml' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'High CBD medicinal oil.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ example: 'https://cdn.site.com/products/oil.png' })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: 149.9, minimum: 0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 24.5, minimum: 0 })
  @IsNumber()
  @Min(0)
  cbdPercentage!: number;

  @ApiProperty({ example: 1.2, minimum: 0 })
  @IsNumber()
  @Min(0)
  thcPercentage!: number;

  @ApiProperty({ example: 50, minimum: 0 })
  @IsNumber()
  @Min(0)
  stockQuantity!: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Cannabis Oil 30ml Premium' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated product description.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.site.com/products/oil-v2.png' })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 159.9, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 26.0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cbdPercentage?: number;

  @ApiPropertyOptional({ example: 0.9, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  thcPercentage?: number;

  @ApiPropertyOptional({ example: 40, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;
}

export class ProductListQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 'oil' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CheckoutItemDto {
  @ApiProperty({ example: '7f098a59-8c70-4f8b-b0a0-73de068249ac' })
  @IsString()
  productId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 149.9, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}

export class RequestCheckoutDto {
  @ApiProperty({ example: 'Joao Silva' })
  @IsString()
  customerName!: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  customerEmail!: string;

  @ApiProperty({ type: [CheckoutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @ApiProperty({ example: 'http://localhost:4566/click-prescriptions/prescriptions/presc.pdf' })
  @IsString()
  @IsUrl()
  prescriptionUrl!: string;

  @ApiProperty({ example: 299.8, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount!: number;
}
