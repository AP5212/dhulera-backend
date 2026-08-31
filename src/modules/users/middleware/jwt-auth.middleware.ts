import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

export interface AccessTokenPayload {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string | null;
  email_id: string | null;
  mobile_number: string | null;
  role_id: string;
  parent_id: string | null;
  state_id: string | null;
  district_id: string | null;
  sub_district_id: string | null;
  location: string | null;
  iat: number;
  exp: number;
}

export type AuthenticatedRequest = Request & { user?: AccessTokenPayload };

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = this.extractToken(request.headers.authorization);

    try {
      request.user =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      next();
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }

  private extractToken(authorization: string | undefined): string {
    if (!authorization?.trim())
      throw new UnauthorizedException('Authorization header is required.');

    const parts = authorization.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer')
      return parts[1];

    throw new UnauthorizedException(
      'Authorization header must contain a JWT or Bearer JWT.',
    );
  }
}
