import { Query, Resolver } from '@nestjs/graphql';
import { HealthService } from 'src/core/services/health.service';

@Resolver()
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Query(() => String)
  status(): string {
    return this.healthService.getStatus().status;
  }
}
