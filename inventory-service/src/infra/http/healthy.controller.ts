import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthyResponseDto } from './dto/healthy-response.dto';

@ApiTags('health')
@Controller()
export class HealthyController {
  @Get('healthy')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'Service health status.',
    type: HealthyResponseDto,
  })
  healthy(): HealthyResponseDto {
    return {
      status: 'ok',
      service: 'inventory-service',
    };
  }
}
