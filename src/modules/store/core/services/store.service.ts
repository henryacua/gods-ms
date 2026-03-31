import { Inject, Injectable } from '@nestjs/common';
import { IStoreRepository } from '../interfaces/store.interface';
import { Store } from '../entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from '../dtos/store.dto';

@Injectable()
export class StoreService {
  constructor(
    @Inject('IStoreRepository')
    private readonly storeRepository: IStoreRepository,
  ) {}

  async getAll(): Promise<Store[]> {
    return this.storeRepository.getAll();
  }

  async getById(id: number): Promise<Store> {
    return this.storeRepository.getById(id);
  }

  async create(store: CreateStoreDto): Promise<Store> {
    return this.storeRepository.create(store);
  }

  async update(store: UpdateStoreDto): Promise<Store> {
    return this.storeRepository.update(store);
  }

  async getAllByOrganizationId(organizationId: number): Promise<Store[]> {
    return this.storeRepository.getAllByOrganizationId(organizationId);
  }

  async delete(id: number): Promise<boolean> {
    return this.storeRepository.delete(id);
  }
}
