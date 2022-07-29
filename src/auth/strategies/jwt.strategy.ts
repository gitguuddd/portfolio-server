import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Contains logic associated with JSON web token creation
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Provides options to the parent passport strategy class and creates the JSON webtoken strategy instance
   */
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Extracts the user data from the provided JSON web token
   * @param {Object} payload JSON web token
   * @returns {Object} User data
   */
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin,
    };
  }
}
