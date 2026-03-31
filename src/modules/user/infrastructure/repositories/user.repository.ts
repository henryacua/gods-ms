import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../core/entities/user.entity';
import { IUserRepository } from '../../core/interfaces/reposositories';
import { Logger, NotFoundException } from '@nestjs/common';
import { UserErrors } from '../../core/errors/user.errors';
import {
  AuthCreateUserDto,
  CreateUserDto,
  DeleteUserDto,
  UpdateUserDto,
} from '../../core/dtos/user.dto';

export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    try {
      return this.userRepository.find();
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      throw new NotFoundException(UserErrors.USER_NOT_FOUND);
    }
  }

  async getAllUsersByStoreId(storeId: number): Promise<User[]> {
    try {
      return this.userRepository.find({ where: { storeId } });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      throw new NotFoundException(UserErrors.USER_NOT_FOUND);
    }
  }

  async getAllUsersByOrganizationId(organizationId: number): Promise<User[]> {
    try {
      return this.userRepository
        .createQueryBuilder('user')
        .leftJoin('store', 'store', 'store.id = user.store_id')
        .where('store.organization_id = :organizationId', { organizationId })
        .orWhere('user.organization_id = :organizationId', { organizationId })
        .getMany();
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(error.message);
      }
      throw new NotFoundException(UserErrors.USER_NOT_FOUND);
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id });

      if (!user) {
        throw new NotFoundException(UserErrors.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, id });
      }
      throw new NotFoundException(UserErrors.USER_NOT_FOUND);
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ email });

      if (!user) {
        throw new NotFoundException(UserErrors.USER_BY_EMAIL_NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, email });
      }
      throw new NotFoundException(UserErrors.USER_BY_EMAIL_NOT_FOUND);
    }
  }

  async addNewUser(userData: CreateUserDto): Promise<User> {
    try {
      return await this.userRepository.save(
        this.userRepository.create(userData),
      );
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, userData });
        if (error.message.includes('duplicate key value')) {
          throw new Error(UserErrors.EMAIL_ALREADY_EXISTS);
        }
      }
      throw new Error(UserErrors.COULD_NOT_CREATE_USER);
    }
  }

  async createUser(userData: AuthCreateUserDto): Promise<User> {
    try {
      return await this.userRepository.save(
        this.userRepository.create(userData),
      );
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, userData });
        if (error.message.includes('duplicate key value')) {
          throw new Error(UserErrors.EMAIL_ALREADY_EXISTS);
        }
      }
      throw new Error(UserErrors.COULD_NOT_CREATE_USER);
    }
  }

  async updateUser(userData: UpdateUserDto): Promise<User> {
    try {
      const { id, ...rest } = userData;
      const updateData = Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined),
      );
      if (Object.keys(updateData).length > 0) {
        await this.userRepository.update(id, updateData);
      }
      return this.getUserById(id);
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, userData });
      }
      throw new Error(UserErrors.COULD_NOT_UPDATE_USER);
    }
  }

  async deleteUser(userData: DeleteUserDto): Promise<boolean> {
    try {
      const user = await this.getUserById(userData.id);
      await this.userRepository.softRemove(user);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        Logger.error({ error: error.message, userData });
      }
      throw new Error(UserErrors.COULD_NOT_DELETE_USER);
    }
  }
}
