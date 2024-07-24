import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { Note, NoteSchema } from '../common/schema/note.schema';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
    NotificationModule,
  ],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
