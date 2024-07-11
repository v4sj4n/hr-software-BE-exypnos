import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class SignInUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one special character.',
  })
  password: string;
}
