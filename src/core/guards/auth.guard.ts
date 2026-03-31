import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthErrors } from '../errors/auth.errors';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthPayload } from '../interfaces/gql-context.interface';

@Injectable()
export class AuthGQLGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request: Request = ctx.getContext<{ req: Request }>().req;

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(AuthErrors.TOKEN_NOT_FOUND);
    }
    try {
      const payload = await this.jwtService.verifyAsync<AuthPayload>(token);

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(AuthErrors.INVALID_TOKEN);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
