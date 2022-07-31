import { Injectable, Req } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from "express";

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
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
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

  private static extractJWT(req: Request): string | null {
    if (
      req.cookies &&
      'accessToken' in req.cookies &&
      req.cookies.accessToken.length > 0
    ) {
      return req.cookies.accessToken;
    }
    return null;
  }
}
