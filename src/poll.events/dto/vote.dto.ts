import { IsString } from 'class-validator';

export class VoteDto {
  @IsString()
  option: string;

  @IsString()
  userId: string;
}
