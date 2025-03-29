import { Controller, Get, UseGuards } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { AuthGuard } from 'src/infra/auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller()
export class RabbitmqController {
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  @Get('/restart')
  async restart() {
    return this.rabbitmqService.connectWithRetry();
  }
}
