/**
 * Contains user update data
 */
import { CreateUserInput } from './create-user.dto';
import { Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class UpdateUserInput extends autoImplement<
  Partial<Omit<CreateUserInput, 'password'>>
>() {
  /**
   * Password
   */
  @ValidateIf((o) => o.password !== '')
  @MinLength(8)
  @MaxLength(20)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password should contain at least one upper-case letter, one lower-case letter, and at least one number or special symbol',
  }) // one upper, one lower, one number or special symbol
  password: string;
}
