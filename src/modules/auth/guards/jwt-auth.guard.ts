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

      const userId = payload?.sub || (payload as any)?.user_id || (payload as any)?.id;

      if (!userId) {
        throw new UnauthorizedException('Invalid token payload.');
      }

      (request as RequestWithUser).user = {
        id: String(userId),
        email: payload.email,
        user_id: String(userId),
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization?.trim()) {
      return undefined;
    }

    const parts = authorization.trim().split(/\s+/);
    if (parts.length === 1 && parts[0]) {
      return parts[0];
    }
    const [type, token] = parts;
    return type?.toLowerCase() === 'bearer' && token ? token : undefined;
  }
}
