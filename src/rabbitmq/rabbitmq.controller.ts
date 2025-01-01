import { Controller, Get, UseGuards } from '@nestjs/common';
import { RabbitmqService } from "./rabbitmq.service";
import { ApiKeyGuard } from "src/auth/guards/api-key.guard";

@UseGuards(ApiKeyGuard)
@Controller()
export class RabbitmqController {
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  @Get("/restart")
  async restart() {
    return this.rabbitmqService.connectWithRetry();
  }
}
