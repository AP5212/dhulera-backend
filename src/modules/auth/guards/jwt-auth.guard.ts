import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthUser, JwtPayload } from '../types/auth-user.type';

export type RequestWithUser = Request & { user: AuthUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authorization token is missing.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid token payload.');
      }

      (request as RequestWithUser).user = {
        id: payload.sub,
        email: payload.email,
        user_id: payload.sub,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.trim().split(/\s+/);
    return type?.toLowerCase() === 'bearer' && token ? token : undefined;
  }
}
