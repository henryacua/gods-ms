import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger, NotFoundException } from '@nestjs/common';
import { IStoreRepository } from '../../core/interfaces/store.interface';
import { Store } from '../../core/entities/store.entity';
import { StoreErrors } from '../../core/errors/store.errors';
import { CreateStoreDto, UpdateStoreDto } from '../../core/dtos/store.dto';

export class StoreRepository implements IStoreRepository {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async getAll(): Promise<Store[]> {
    try {
      return this.storeRepository.find();
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      throw new NotFoundException(StoreErrors.COULD_NOT_FIND_STORE);
    }
  }

  async getAllByOrganizationId(organizationId: number): Promise<Store[]> {
    try {
      return this.storeRepository.find({ where: { organizationId } });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      throw new NotFoundException(StoreErrors.COULD_NOT_FIND_STORE);
    }
  }

  async getById(id: number): Promise<Store> {
    try {
      const store = await this.storeRepository.findOneBy({ id });

      if (!store) {
        throw new NotFoundException(StoreErrors.COULD_NOT_FIND_STORE);
      }

      return store;
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, id });
      }
      throw new NotFoundException(StoreErrors.COULD_NOT_FIND_STORE);
    }
  }

  async create(createStoreData: CreateStoreDto): Promise<Store> {
    try {
      return this.storeRepository.save(
        this.storeRepository.create(createStoreData),
      );
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({
          error: error.message,
          createStoreData,
        });
      }
      throw new Error(StoreErrors.COULD_NOT_CREATE_STORE);
    }
  }

  async update(updateStoreData: UpdateStoreDto): Promise<Store> {
    try {
      const store = await this.getById(updateStoreData.id);

      Object.assign(store, updateStoreData);
      return await this.storeRepository.save(store);
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({
          error: error.message,
          updateStoreData,
        });
      }
      throw new Error(StoreErrors.COULD_NOT_UPDATE_STORE);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const store = await this.getById(id);
      await this.storeRepository.softRemove(store);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, id });
      }
      throw new Error(StoreErrors.COULD_NOT_DELETE_STORE);
    }
  }
}
