import { IsArray, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsArray()
  @IsString({ each: true })
  participants: string[];
}
