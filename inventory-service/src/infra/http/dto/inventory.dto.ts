import { ApiProperty } from '@nestjs/swagger';

export class InventoryItemResponseDto {
  @ApiProperty({
    example: '7f098a59-8c70-4f8b-b0a0-73de068249ac',
    description: 'Product id from catalog service',
  })
  id!: string;

  @ApiProperty({ example: 12, minimum: 0 })
  stockQuantity!: number;
}

export class CreateInventoryItemDto {
  @ApiProperty({
    example: '7f098a59-8c70-4f8b-b0a0-73de068249ac',
    description: 'Product id from catalog service',
  })
  id!: string;

  @ApiProperty({ example: 20, minimum: 0 })
  stockQuantity!: number;
}

export class UpdateInventoryItemDto {
  @ApiProperty({ example: 18, minimum: 0 })
  stockQuantity!: number;
}
