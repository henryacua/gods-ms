import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrganizationRepository } from '../../core/interfaces/organization.interface';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../../core/dtos/organization.dto';
import { Organization } from '../../core/entities/oganization.entity';
import { Logger, NotFoundException } from '@nestjs/common';
import { OrganizationErrors } from '../../core/errors/organization.errors';

export class OrganizationRepository implements IOrganizationRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async getAll(): Promise<Organization[]> {
    try {
      return this.organizationRepository.find();
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      throw new NotFoundException(
        OrganizationErrors.COULD_NOT_FIND_ORGANIZATION,
      );
    }
  }

  async getById(id: number): Promise<Organization> {
    try {
      const organization = await this.organizationRepository.findOneBy({ id });

      if (!organization) {
        throw new NotFoundException(
          OrganizationErrors.COULD_NOT_FIND_ORGANIZATION,
        );
      }

      return organization;
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, id });
      }
      throw new NotFoundException(
        OrganizationErrors.COULD_NOT_FIND_ORGANIZATION,
      );
    }
  }

  async createOne(
    createOrganizationData: CreateOrganizationDto,
  ): Promise<Organization> {
    try {
      return this.organizationRepository.save(
        this.organizationRepository.create(createOrganizationData),
      );
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, createOrganizationData });
      }
      throw new Error(OrganizationErrors.COULD_NOT_CREATE_ORGANIZATION);
    }
  }

  async update(
    updateOrganizationData: UpdateOrganizationDto,
  ): Promise<Organization> {
    try {
      const organization = await this.getById(updateOrganizationData.id);

      Object.assign(organization, updateOrganizationData);
      return await this.organizationRepository.save(organization);
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, updateOrganizationData });
      }
      throw new Error(OrganizationErrors.COULD_NOT_UPDATE_ORGANIZATION);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const organization = await this.getById(id);
      await this.organizationRepository.softRemove(organization);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, id });
      }
      throw new Error(OrganizationErrors.COULD_NOT_DELETE_ORGANIZATION);
    }
  }
}
