import {
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Decorator used to extract user data from a REST request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, host: ExecutionContext) => {
    const req = host.switchToHttp().getRequest();
    const { user } = req.user;
    return user as User;
  },
);
