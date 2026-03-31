import { Module } from '@nestjs/common';
import { OrganizationResolver } from './infrastructure/resolvers/organization.resolver';
import { OrganizationService } from './core/services/organization.service';
import { OrganizationRepository } from './infrastructure/repositories/organization.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './core/entities/oganization.entity';

const services = [OrganizationService, OrganizationResolver];

const interfaces = [
  { provide: 'IOrganizationRepository', useClass: OrganizationRepository },
];

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  controllers: [],
  providers: [...services, ...interfaces],
})
export class OrganizationModule {}
