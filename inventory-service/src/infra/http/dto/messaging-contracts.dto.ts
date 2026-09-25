import { ApiProperty } from '@nestjs/swagger';

export class CheckoutRequestedItemDto {
  @ApiProperty({ example: '7f098a59-8c70-4f8b-b0a0-73de068249ac' })
  productId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  quantity!: number;

  @ApiProperty({ example: 149.9, minimum: 0 })
  price!: number;
}

export class CheckoutRequestedEventDto {
  @ApiProperty({ example: '0b679a3d-c78f-43bf-bbd3-c4f37022bd0f' })
  orderId!: string;

  @ApiProperty({ example: 'Joao Silva' })
  customerName!: string;

  @ApiProperty({ example: 'joao@email.com' })
  customerEmail!: string;

  @ApiProperty({ type: [CheckoutRequestedItemDto] })
  items!: CheckoutRequestedItemDto[];

  @ApiProperty({ example: 'https://bucket.s3.amazonaws.com/prescriptions/prescription-001.jpg' })
  prescriptionUrl!: string;

  @ApiProperty({ example: 299.8, minimum: 0 })
  totalAmount!: number;
}

export class StockReservedEventDto {
  @ApiProperty({ example: '0b679a3d-c78f-43bf-bbd3-c4f37022bd0f' })
  orderId!: string;

  @ApiProperty({ example: 'Joao Silva' })
  customerName!: string;

  @ApiProperty({ example: 'joao@email.com' })
  customerEmail!: string;

  @ApiProperty({ example: 299.8, minimum: 0 })
  totalAmount!: number;

  @ApiProperty({ example: 'https://bucket.s3.amazonaws.com/prescriptions/prescription-001.jpg' })
  prescriptionUrl!: string;
}

export class MessagingContractsResponseDto {
  @ApiProperty({ example: 'checkout.requested' })
  consumeQueue!: string;

  @ApiProperty({ type: CheckoutRequestedEventDto })
  consumePayloadExample!: CheckoutRequestedEventDto;

  @ApiProperty({ example: 'stock.reserved' })
  publishQueue!: string;

  @ApiProperty({ type: StockReservedEventDto })
  publishPayloadExample!: StockReservedEventDto;
}
