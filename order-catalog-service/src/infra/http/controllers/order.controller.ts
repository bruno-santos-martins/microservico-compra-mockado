import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { RequestCheckoutUseCase } from '../../../application/use-cases/request-checkout.use-case';
import { GetTrackingUseCase } from '../../../application/use-cases/get-tracking.use-case';
import { RequestCheckoutDto } from './dto';

@Controller('orders')
@UsePipes(new ValidationPipe({ transform: true }))
export class OrderController {
  constructor(
    private readonly requestCheckoutUseCase: RequestCheckoutUseCase,
    private readonly getTrackingUseCase: GetTrackingUseCase
  ) {}

  @Post('checkout')
  async checkout(@Body() dto: RequestCheckoutDto) {
    return this.requestCheckoutUseCase.execute(dto);
  }

  @Get('tracking/:code')
  async tracking(@Param('code') code: string) {
    const checkpoints = await this.getTrackingUseCase.execute(code);
    return {
      trackingCode: code,
      patientName: 'Paciente',
      prescriptionUrl: 'pending',
      checkpoints,
    };
  }
}
