import { Controller, Get } from '@nestjs/common';
import { HealthService } from 'src/core/services/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHello(): { status: string } {
    return this.healthService.getStatus();
  }
}
