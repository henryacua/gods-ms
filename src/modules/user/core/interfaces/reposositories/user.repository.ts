import {
  AuthCreateUserDto,
  CreateUserDto,
  DeleteUserDto,
  UpdateUserDto,
} from '../../dtos/user.dto';
import { User } from '../../entities/user.entity';

export interface IUserRepository {
  getAllUsers(): Promise<User[]>;
  getAllUsersByStoreId(storeId: number): Promise<User[]>;
  getAllUsersByOrganizationId(organizationId: number): Promise<User[]>;
  getUserById(id: number): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
  addNewUser(userData: CreateUserDto): Promise<User>;
  createUser(userData: AuthCreateUserDto): Promise<User>;
  updateUser(userData: UpdateUserDto): Promise<User>;
  deleteUser(userData: DeleteUserDto): Promise<boolean>;
}
