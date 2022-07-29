/**
 * Contains logic associated with users data management
 */
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { UpdateUserInput } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  /**
   * Performs dependency injection and constructs the service instance
   * @param {PrismaService} prisma Prisma service instance
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a user record
   * @param {CreateUserInput} createUserInput An object which contains the data needed for the user creation
   * @returns {UserType} Created user object
   */
  async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      const { email, password } = createUserInput;
      const user = await this.prisma.user.create({
        data: {
          id: uuid(),
          email,
          password: await this.hashPassword(password),
        },
      });
      return user;
    } catch (error) {
      this.prisma.throwErr(error);
    }
  }

  /**
   * Finds and returns all the users
   * @returns {User} An array of users
   */
  findAll() {
    const users = this.prisma.user.findMany({
      where: {
        isAdmin: false,
      },
    });
    return users;
  }

  /**
   * Finds the user by its identifier and returns it
   * @param {number} id User identifier
   * @returns {User} User object
   */
  findOne(id: string) {
    const user = this.prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

  /**
   * Finds the user by its email and returns it
   * @param {string} email User email
   * @returns {UserType} User object
   */
  findOneByEmail(email: string) {
    const user = this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  /**
   * Updates the specified user with data provided
   * @param {number} id User identifier
   * @param {UpdateUserInput} updateUserInput An object which contains the data required for the user update
   * @returns {User} An updated user object
   */
  async update(id: string, updateUserInput: UpdateUserInput) {
    try {
      const { password, ...updateData } = updateUserInput;

      if (password.length > 0) {
        updateData['password'] = await this.hashPassword(password);
      }
      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
      return user;
    } catch (error) {
      this.prisma.throwErr(error, id);
    }
  }

  /**
   * Removes the specified user
   * @param {number} id User identifier
   * @returns {UserType} The object of deleted user
   */
  async remove(id: string) {
    const where = { id };

    const user = await this.prisma.user.delete({
      where,
    });

    return user;
  }

  /**
   * Applies hashing function to plaintext password
   * @param {string} plainTextPassword Plain text password
   * @returns {string} Hashed password
   */
  async hashPassword(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, 12);
  }
}
