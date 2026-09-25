import { ApiProperty } from '@nestjs/swagger';

export class HealthyResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'inventory-service' })
  service!: string;
}
