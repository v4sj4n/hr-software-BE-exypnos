// dto/reset-password.dto.ts
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;  // Token for resetting password

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;  // Password should have at least 8 characters
}
