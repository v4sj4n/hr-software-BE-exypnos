import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enum/role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @IsString()
  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  pob?: string;
}
