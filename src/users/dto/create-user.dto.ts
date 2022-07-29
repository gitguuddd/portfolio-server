/**
 * Contains user creation data
 */ import { isEmail, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserInput {
  /**
   * Email
   */
  email: string;

  /**
   * Password
   */
  @MinLength(8)
  @MaxLength(20)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password should contain at least one upper-case letter, one lower-case letter, and at least one number or special symbol'
  }) // one upper, one lower, one number or special symbol
  password: string;
}