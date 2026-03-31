import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../dtos/organization.dto';
import { Organization } from '../entities/oganization.entity';

export interface IOrganizationRepository {
  getAll(): Promise<Organization[]>;
  getById(id: number): Promise<Organization>;
  createOne(
    createOrganizationData: CreateOrganizationDto,
  ): Promise<Organization>;
  update(updateOrganizationData: UpdateOrganizationDto): Promise<Organization>;
  delete(id: number): Promise<boolean>;
}
