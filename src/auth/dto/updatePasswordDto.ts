import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;

  @IsOptional() 
  @IsEmail()
  email?: string;
}
