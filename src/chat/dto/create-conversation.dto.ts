import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
    @IsArray() 
    @ArrayNotEmpty() 
    @IsString({ each: true })
    readonly participants: string[];
}
