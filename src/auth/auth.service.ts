import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async attemptLogin(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordsMatch: boolean = bcrypt.compare(pass, user.password);

    if (!passwordsMatch) {
      throw new Error('Invalid credentials');
    }

    try {
      return await this.jwtService.signAsync({
        email: user.email,
        isAdmin: user.isAdmin,
        sub: user.id,
      });
    } catch (e) {
      console.log(e);
    }
  }
}
