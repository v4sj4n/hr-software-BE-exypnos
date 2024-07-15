import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enum/role.enum';

export class UpdateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsOptional()
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @IsOptional()
  lastName: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @MinLength(10)
  @MaxLength(15)
  @IsOptional()
  phone: string;

  @IsString()
  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @IsOptional()
  imageUrl?: string;
}
