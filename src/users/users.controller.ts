import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { AdminGuard } from '../common/guards/admin.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('')
  async create(@Body() createUserInput: CreateUserInput) {
    console.log(createUserInput);
    try {
      const user: User = await this.usersService.create(createUserInput);
      console.log('trying');
      return user;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('/adminAuth')
  getAdmin() {
    return 'admin auth';
  }

  @UseGuards(JwtAuthGuard)
  @Get('/auth')
  getRegular() {
    return 'regular auth';
  }
}
