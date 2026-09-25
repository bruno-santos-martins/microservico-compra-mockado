import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthyController {
  @Get('healthy')
  healthy() {
    return {
      status: 'ok',
      service: 'order-catalog-service',
    };
  }
}
