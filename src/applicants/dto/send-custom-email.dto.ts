import { IsString, IsOptional } from 'class-validator';

export class SendCustomEmailDto {
  @IsOptional()
  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  message: string;
}
