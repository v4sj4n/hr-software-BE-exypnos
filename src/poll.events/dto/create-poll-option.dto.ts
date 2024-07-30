import { IsString } from 'class-validator';

export class CreatePollOptionDto {
  @IsString()
  option: string;

}
