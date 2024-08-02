import { IsNotEmpty, IsString } from 'class-validator';

export class SendCustomEmailDto {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
