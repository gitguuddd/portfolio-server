/**
 * Contains the refresh token data. This token is used to refresh expired user access tokens
 */
export class RefreshToken {
  /**
   * Refresh token identifier
   */
  id: string;

  /**
   * Refresh token value
   */
  token: string;

  /**
   * Refresh token expiry date
   */
  expiryDate: number;

  /**
   * User identifier
   */
  userId: string;
}
