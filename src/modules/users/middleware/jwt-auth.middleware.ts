import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

export interface AccessTokenPayload {
  sub?: string;
  user_id?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    user_id: string;
    [key: string]: any;
  };
};

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = this.extractToken(request.headers.authorization);

    // No Authorization header — treat as anonymous request and continue.
    // Routes that truly require auth should validate request.user in the controller/service.
    if (!token) {
      return next();
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      const userId = payload.sub || payload.user_id;

      if (!userId) {
        throw new UnauthorizedException('Invalid token payload.');
      }

      request.user = {
        id: userId,
        user_id: userId,
        email: payload.email ?? '',
        ...payload,
      };
      next();
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }

  /**
   * Extracts the raw JWT string from the Authorization header.
   * Returns null when no header is present (anonymous request).
   * Throws when the header format is malformed.
   */
  private extractToken(authorization: string | undefined): string | null {
    if (!authorization?.trim()) {
      return null; // no header → anonymous, let route handler decide
    }

    const parts = authorization.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }

    throw new UnauthorizedException(
      'Authorization header must be: Bearer <token>',
    );
  }
}

