import { Inject } from '@nestjs/common';
import { IOrganizationRepository } from '../interfaces/organization.interface';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../dtos/organization.dto';
import { Organization } from '../entities/oganization.entity';

export class OrganizationService {
  constructor(
    @Inject('IOrganizationRepository')
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async getAllOrganizations(): Promise<Organization[]> {
    return this.organizationRepository.getAll();
  }

  async getOrganizationById(id: number): Promise<Organization> {
    return this.organizationRepository.getById(id);
  }

  async createOrganization(
    createOrganizationData: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationRepository.createOne(createOrganizationData);
  }

  updateOrganization(
    updateOrganizationData: UpdateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationRepository.update(updateOrganizationData);
  }

  deleteOrganization(id: number): Promise<boolean> {
    return this.organizationRepository.delete(id);
  }
}
