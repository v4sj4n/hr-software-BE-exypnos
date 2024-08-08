import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { GradeType, PositionType } from 'src/common/enum/position.enum';
import { Role } from 'src/common/enum/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  lastName: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone: string;

  @IsOptional()
  @IsString()
  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  pob?: string;

  @IsOptional()
  @IsString()
  @IsEnum(PositionType)
  position: PositionType;

  @IsOptional()
  @IsString()
  @IsEnum(GradeType)
  grade: GradeType;
}
