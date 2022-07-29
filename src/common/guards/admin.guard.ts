import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Observable } from 'rxjs';

/**
 * Checks if the request sender has admin privileges
 */
@Injectable()
export class AdminGuard extends JwtAuthGuard {
  /**
   * Performs admin account validation
   * @param {ExecutionContext} context Context data object
   * @returns {boolean} Indicates that the user is an admin
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { user } = context.switchToHttp().getRequest();
    console.log(user);
    return user.isAdmin;
  }
}
