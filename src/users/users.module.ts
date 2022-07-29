import { UsersService } from './users.service';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [UsersService, UsersController],
  controllers: [UsersController],
  exports: [UsersService, UsersController],
  imports: [PrismaModule],
})
export class UsersModule {}
