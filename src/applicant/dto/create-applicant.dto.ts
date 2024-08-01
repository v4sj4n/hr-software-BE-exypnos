import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class CreateApplicantDto {
  @IsString()
  @MinLength(3)
  firstName: string;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsString()
  experience: string;

  @IsString()
  applicationMethod: string;

  @IsString()
  age: number;

  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phoneNumber: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  positionApplied: string;

  @IsString()
  technologiesUsed: string;

  @IsString()
  salaryExpectations: string;
}
