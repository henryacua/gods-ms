import { CreateStoreDto, UpdateStoreDto } from '../dtos/store.dto';
import { Store } from '../entities/store.entity';

export interface IStoreRepository {
  getAll(): Promise<Store[]>;
  getAllByOrganizationId(organizationId: number): Promise<Store[]>;
  getById(id: number): Promise<Store>;
  create(createStoreData: CreateStoreDto): Promise<Store>;
  update(updateStoreData: UpdateStoreDto): Promise<Store>;
  delete(id: number): Promise<boolean>;
}
