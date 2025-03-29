import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserFromToken } from '../dto/token-payload.dto';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserFromToken => {
    const request = ctx.switchToHttp().getRequest();
    return {
      sub: request.user?.sub,
      username: request.user?.username,
      email: request.user?.email,
    };
  },
);
