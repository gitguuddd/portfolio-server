import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res, UseGuards
} from "@nestjs/common";
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthPayload } from './entities/authPayload.entity';
import { DateTime } from 'luxon';
import { CurrentUser } from '../common/decorators/currentUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { Request, Response } from 'express';
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

const TOKEN_COOKIE_OPTIONS = {
  domain: process.env.BASE_URL.split('//')[1].split(':')[0],
  httpOnly: true,
  path: '/',
  sameSite: true,
  secure: !!process.env.BASE_URL.includes('https'),
};

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  async login(
    @Res({ passthrough: true }) res,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    try {
      const payload: AuthPayload = await this.authService.attemptLogin(
        email,
        password,
      );

      this.addTokensToCookies(
        res,
        payload.refreshToken,
        payload.accessToken,
        payload.refreshExpiry,
      );
    } catch (e) {
      console.log(e.message);
      throw new BadRequestException(e);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    const { refreshToken } = req.cookies;

    const payload = await this.authService.refreshToken(refreshToken);

    this.addTokensToCookies(
      res,
      payload.refreshToken,
      payload.accessToken,
      payload.refreshExpiry,
    );

    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Post('signOut')
  async signOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: User,
  ) {
    const { refreshToken, accessToken } = req.cookies;
    console.log(user);

    await this.authService.attemptSignout(user, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      ...TOKEN_COOKIE_OPTIONS,
      expires: new Date(0),
    });
    res.cookie('accessToken', accessToken, {
      ...TOKEN_COOKIE_OPTIONS,
      expires: new Date(0),
    });

    return true;
  }

  private addTokensToCookies(
    response: Response,
    refreshToken: string,
    accessToken: string,
    expiry: number,
  ): any {
    const jwtExpiry = Math.floor(
      DateTime.local().toSeconds() + parseInt(process.env.JWT_EXPIRY),
    );

    response.cookie('accessToken', accessToken, {
      ...TOKEN_COOKIE_OPTIONS,
      expires: new Date(
        Date.parse(
          DateTime.fromSeconds(jwtExpiry, {
            zone: process.env.JWT_ZONE,
          }).toString(),
        ),
      ),
    });
    response.cookie('refreshToken', refreshToken, {
      ...TOKEN_COOKIE_OPTIONS,
      expires: new Date(
        Date.parse(
          DateTime.fromSeconds(expiry, {
            zone: process.env.JWT_ZONE,
          }).toString(),
        ),
      ),
    });
  }
}
