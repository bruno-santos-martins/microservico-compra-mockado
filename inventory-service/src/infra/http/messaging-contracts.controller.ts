import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  type MessagingContractsResponseDto,
} from './dto/messaging-contracts.dto';

@ApiTags('messaging')
@Controller('contracts')
export class MessagingContractsController {
  @Get('messaging')
  @ApiOperation({
    summary: 'Get RabbitMQ message contracts',
    description:
      'Describes the queues and payloads used by inventory-service for asynchronous communication.',
  })
  @ApiOkResponse({
    description: 'Current RabbitMQ consume/publish contracts for this service.',
    schema: {
      example: {
        consumeQueue: 'checkout.requested',
        consumePayloadExample: {
          orderId: '0b679a3d-c78f-43bf-bbd3-c4f37022bd0f',
          customerName: 'Joao Silva',
          customerEmail: 'joao@email.com',
          items: [
            {
              productId: '7f098a59-8c70-4f8b-b0a0-73de068249ac',
              quantity: 2,
              price: 149.9,
            },
          ],
          prescriptionUrl:
            'https://bucket.s3.amazonaws.com/prescriptions/prescription-001.jpg',
          totalAmount: 299.8,
        },
        publishQueue: 'stock.reserved',
        publishPayloadExample: {
          orderId: '0b679a3d-c78f-43bf-bbd3-c4f37022bd0f',
          customerName: 'Joao Silva',
          customerEmail: 'joao@email.com',
          totalAmount: 299.8,
          prescriptionUrl:
            'https://bucket.s3.amazonaws.com/prescriptions/prescription-001.jpg',
        },
      },
    },
  })
  getMessagingContracts(): MessagingContractsResponseDto {
    return {
      consumeQueue: 'checkout.requested',
      consumePayloadExample: {
        orderId: '0b679a3d-c78f-43bf-bbd3-c4f37022bd0f',
        customerName: 'Joao Silva',
        customerEmail: 'joao@email.com',
        items: [
          {
            productId: '7f098a59-8c70-4f8b-b0a0-73de068249ac',
            quantity: 2,
            price: 149.9,
          },
        ],
        prescriptionUrl:
          'https://bucket.s3.amazonaws.com/prescriptions/prescription-001.jpg',
        totalAmount: 299.8,
      },
      publishQueue: 'stock.reserved',
      publishPayloadExample: {
        orderId: '0b679a3d-c78f-43bf-bbd3-c4f37022bd0f',
        customerName: 'Joao Silva',
        customerEmail: 'joao@email.com',
        totalAmount: 299.8,
        prescriptionUrl:
          'https://bucket.s3.amazonaws.com/prescriptions/prescription-001.jpg',
      },
    };
  }
}
