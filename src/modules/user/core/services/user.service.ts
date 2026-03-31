import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { IUserRepository } from '../interfaces/reposositories';
import { User } from '../entities/user.entity';
import {
  AuthCreateUserDto,
  CreateUserDto,
  ResetPasswordDto,
  TokenDto,
  UpdateUserDto,
  UserLoginDto,
} from '../dtos/user.dto';
import { Role } from '../enums/user.enum';
import { UserErrors } from '../errors/user.errors';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/modules/notification/core/services/email.service';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.getAllUsers();
  }

  async getUserById(id: number): Promise<User> {
    return await this.userRepository.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.userRepository.getUserByEmail(email);
  }

  async getAllUsersByStoreId(storeId: number): Promise<User[]> {
    return await this.userRepository.getAllUsersByStoreId(storeId);
  }

  async getAllUsersByOrganizationId(organizationId: number): Promise<User[]> {
    return await this.userRepository.getAllUsersByOrganizationId(
      organizationId,
    );
  }

  async addNewUser(userData: CreateUserDto): Promise<User> {
    const { password, ...rest } = userData;
    const hashedPassword = await User.hashPassword(password);
    const safeUserData: CreateUserDto = {
      ...rest,
      password: hashedPassword,
      roles: [Role.USER],
    };

    return await this.userRepository.addNewUser(safeUserData);
  }

  async createUser(userData: AuthCreateUserDto): Promise<User> {
    const { password, ...rest } = userData;
    const hashedPassword = await User.hashPassword(password);

    return await this.userRepository.createUser({
      ...rest,
      password: hashedPassword,
    });
  }

  async updateUser(userData: UpdateUserDto): Promise<User> {
    const { password, ...rest } = userData;
    if (password) {
      const hashedPassword = await User.hashPassword(password);
      Object.assign(userData, { password: hashedPassword, ...rest });
    }

    await this.getUserById(userData.id);
    return this.userRepository.updateUser(userData);
  }

  async deleteUser(userId: number): Promise<boolean> {
    const user = await this.getUserById(userId);

    const userData = { id: user.id, deletedAt: new Date() };

    return await this.userRepository.deleteUser(userData);
  }

  async generateToken(user: User): Promise<{ token: string }> {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
      storeId: user.storeId ?? null,
      organizationId: user.organizationId ?? null,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  async refreshToken(userId: number): Promise<{ token: string }> {
    const user = await this.getUserById(userId);
    return this.generateToken(user);
  }

  async selectOrganization(
    userId: number,
    orgId: number,
    storeId: number | null,
  ): Promise<{ token: string }> {
    const user = await this.getUserById(userId);
    await this.userRepository.updateUser({
      id: userId,
      organizationId: orgId,
      ...(storeId !== null ? { storeId } : {}),
    });
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
      storeId,
      organizationId: orgId,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  async selectStore(
    userId: number,
    storeId: number,
  ): Promise<{ token: string }> {
    const user = await this.getUserById(userId);
    await this.userRepository.updateUser({ id: userId, storeId });
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
      storeId,
      organizationId: user.organizationId ?? null,
    };
    const token = await this.jwtService.signAsync(payload);
    return { token };
  }

  async login(userLoginData: UserLoginDto): Promise<{ token: string }> {
    const { email, password } = userLoginData;
    let user: User;

    try {
      user = await this.getUserByEmail(email);
    } catch (error) {
      if (error instanceof Error) Logger.error({ error: error.message, email });
      throw new UnauthorizedException(UserErrors.INVALID_CREDENTIALS);
    }

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException(UserErrors.INVALID_CREDENTIALS);
    }

    return this.generateToken(user);
  }

  async sendEmailResetPassword(email: string): Promise<boolean> {
    let user: User;

    try {
      user = await this.getUserByEmail(email);
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(UserErrors.USER_BY_EMAIL_NOT_FOUND);
      }
      return true;
    }

    const resetToken = this.generateResetToken();
    await this.userRepository.updateUser({
      id: user.id,
      resetPasswordToken: resetToken,
    });

    return this.emailService.sendEmail({
      userId: user.id,
      email,
      resetToken: resetToken.token,
    });
  }

  async resetPassword(resetPasswordData: ResetPasswordDto): Promise<boolean> {
    const { userId, token, newPassword } = resetPasswordData;
    let user: User;

    try {
      user = await this.getUserById(userId);
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(UserErrors.USER_NOT_FOUND);
      }
      return false;
    }

    if (user.resetPasswordToken?.token !== token) {
      throw new UnauthorizedException(UserErrors.INVALID_RESET_PASSWORD_TOKEN);
    }

    if (new Date(user.resetPasswordToken.expiresAt) < new Date()) {
      throw new UnauthorizedException(UserErrors.TOKEN_EXPIRED);
    }

    if (await user.validatePassword(newPassword)) {
      throw new UnauthorizedException(UserErrors.NEW_PASSWORD_SAME_AS_OLD);
    }

    await this.userRepository.updateUser({
      id: user.id,
      resetPasswordToken: null,
      password: await User.hashPassword(newPassword),
    });

    return true;
  }

  private generateResetToken(): TokenDto {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return { token, expiresAt };
  }
}
