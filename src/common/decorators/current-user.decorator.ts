import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom parameter decorator to extract the authenticated user (or a specific field)
 * from the request object in route handlers.
 *
 * Example:
 *   @Post('create')
 *   @UseGuards(JwtAuthGuard)
 *   async create(@CurrentUser('user_id') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);
