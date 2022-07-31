import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { RefreshToken } from './entities/refeshToken.entity';
import { PrismaService } from '../prisma/prisma.service';
import { DateTime } from 'luxon';
import { AuthPayload } from './entities/authPayload.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async attemptLogin(email: string, pass: string): Promise<AuthPayload> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordsMatch: boolean = bcrypt.compare(pass, user.password);

    if (!passwordsMatch) {
      throw new Error('Invalid credentials');
    }

    const accessToken = await this.signAccessToken(user);

    const unhashedRefreshToken = uuid();
    const refreshTokenExpiry =
      DateTime.local().toSeconds() + parseInt(process.env.REFRESH_TOKEN_EXPIRY);

    await this.createRefreshToken(
      user,
      unhashedRefreshToken,
      refreshTokenExpiry,
    );

    try {
      return {
        accessToken,
        refreshToken: unhashedRefreshToken,
        refreshExpiry: refreshTokenExpiry,
      };
    } catch (e) {
      console.log(e);
    }
  }

  public async attemptSignout(user: User, refreshToken: string) {
    if (!refreshToken) throw new Error('No refresh token provided');
    const foundUser = await this.usersService.findOne(user.id);
    if (!foundUser) throw new Error('Invalid user');

    await this.invalidateToken(refreshToken);
  }

  private async signAccessToken(user: User): Promise<string> {
    return await this.jwtService.signAsync({
      email: user.email,
      isAdmin: user.isAdmin,
      sub: user.id,
    });
  }

  public async refreshToken(refreshToken: string): Promise<AuthPayload> {
    if (!refreshToken) throw new Error('No refresh token provided');

    const existingRefreshToken: RefreshToken = await this.getExistingToken(
      refreshToken,
    );
    const userId = existingRefreshToken.userId;
    const user = await this.usersService.findOne(userId);

    if (!user) throw new Error('Invalid user');

    const newUnhashedRefreshToken = uuid();
    const newRefreshTokenExpiry =
      DateTime.local().toSeconds() + parseInt(process.env.REFRESH_TOKEN_EXPIRY);

    await this.createRefreshToken(
      user,
      newUnhashedRefreshToken,
      newRefreshTokenExpiry,
    );

    const accessToken = await this.signAccessToken(user);

    return {
      accessToken,
      refreshToken: newUnhashedRefreshToken,
      refreshExpiry: newRefreshTokenExpiry,
    };
  }

  private async createRefreshToken(
    user: User,
    unhashedToken: string,
    expiry: number,
  ): Promise<RefreshToken> {
    const refreshTokenHash = await bcrypt.hash(
      unhashedToken,
      process.env.REFRESH_TOKEN_SALT,
    );

    try {
      const refreshToken = await this.prisma.refreshToken.create({
        data: {
          id: uuid(),
          token: refreshTokenHash,
          expiryDate: Math.floor(expiry),
          user: {
            connect: { id: user.id },
          },
        },
      });
      return refreshToken;
    } catch (e) {
      this.prisma.throwErr(e);
    }
  }

  private async invalidateToken(refreshToken: string) {
    const existingValidToken = await this.getExistingToken(refreshToken);

    try {
      await this.prisma.refreshToken.deleteMany({
        where: {
          token: existingValidToken.token,
        },
      });
    } catch (e) {
      this.prisma.throwErr(e);
    }
  }

  private async removeExpiredRefreshTokens(user: User, refreshToken: string) {
    const now = Math.floor(DateTime.local().toSeconds());
    const existingValidToken: RefreshToken = await this.getExistingToken(
      refreshToken,
    );

    try {
      await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { token: existingValidToken.token },
            {
              expiryDate: {
                lt: now,
              },
            },
          ],
          userId: user.id,
        },
      });
    } catch (e) {
      this.prisma.throwErr(e);
    }
  }

  private async getExistingToken(refreshToken: string): Promise<RefreshToken> {
    const hashedToken = await bcrypt.hash(
      refreshToken,
      process.env.REFRESH_TOKEN_SALT,
    );

    const existingValidToken: RefreshToken | undefined =
      await this.prisma.refreshToken.findUnique({
        where: {
          token: hashedToken,
        },
      });

    if (!existingValidToken) throw new Error('Invalid refresh token');
    return existingValidToken;
  }
}
