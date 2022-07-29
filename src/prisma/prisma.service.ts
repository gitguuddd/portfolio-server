import { BadRequestException, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from '@prisma/client';

/**
 * Contains prisma error information
 */
interface ErrorType {
  /**
   * Error code
   */
  code: string;
  /**
   * Error metadata
   */
  meta: { target: Array<string> };
}

/**
 * Contains logic associated with prisma client usage
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy{
  /**
   * Performs dependency injection and constructs the service instance
   */
  constructor() {
    super({
      /*log: ['query']*/
    });
  }

  /**
   * Fired on module initialization
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Fired on module destruction
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Handles prisma error throwing
   * @param {ErrorType} error Prisma error object
   * @param {string|number} id Identifier of the entity that caused the error
   * @param {string} model Entity type of the entity that caused the error
   */
  throwErr(error: ErrorType, id?: string | number, model?: string) {
    if (error.code === 'P2016') {
      throw new BadRequestException(
        `${model || 'Entity'} with id of "${id}" does not exist`
      );
    } else if (error.code === 'P2002') {
      throw new BadRequestException(
        `${model || 'Error'}: ${error.meta.target[0]} already in use`,
      );
    } else {
      throw error;
    }
  }
}
