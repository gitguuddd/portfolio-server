export class User {
  /**
   * User identifier
   */
  id: string;

  /**
   * Email
   */
  email: string;

  /**
   * Password
   */
  password?: string;

  /**
   * Indicates that the user has admin privileges
   */
  isAdmin: boolean;
}