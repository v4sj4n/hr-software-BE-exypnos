import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note } from '../common/schema/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/common/enum/notification.enum';
import { compareDates, formatDate } from 'src/common/util/dateUtil';

@Injectable()
export class NoteService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<Note>,
    private notificationService: NotificationService,
  ) {}

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const createdNote = new this.noteModel(createNoteDto);
    if (createNoteDto.date) {
      createdNote.date = await this.checkDate(createNoteDto.date);
    }

    if (createdNote.willBeReminded) {
      await this.notificationService.createNotification(
        'Note: ' + createdNote.title,
        createdNote.description,
        NotificationType.NOTE,
        createdNote._id as Types.ObjectId,
        createdNote.date,
      );
    }
    return createdNote.save();
  }

  async findAll(): Promise<Note[]> {
    return this.noteModel.find({ isDeleted: false }).exec();
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.noteModel.findById(id);
    if (!note || note.isDeleted) {
      throw new BadRequestException('Note not found');
    }
    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    const exsistingNote = await this.noteModel.findById(id).exec();
    if (!exsistingNote) {
      throw new BadRequestException('Note not found');
    }
    const updatedNote = await this.noteModel.findByIdAndUpdate(
      id,
      updateNoteDto,
      { new: true },
    );
    if (updateNoteDto.date) {
      updatedNote.date = await this.checkDate(updateNoteDto.date);
    }

    if (updatedNote.willBeReminded) {
      await this.notificationService.createNotification(
        'Note: ' + updatedNote.title,
        updatedNote.description,
        NotificationType.NOTE,
        updatedNote._id as Types.ObjectId,
        updatedNote.date,
      );
    }

    return updatedNote;
  }

  async remove(id: string): Promise<Note> {
    const note = await this.noteModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );
    if (!note) {
      throw new BadRequestException('Note not found');
    }
    if (note.willBeReminded) {
      await this.notificationService.updateNotification(
        'Note: ' + note.title,
        note.description,
        NotificationType.NOTE,
        note._id as Types.ObjectId,
        note.date,
        note.isDeleted,
      );
    }
    return note;
  }

  private async checkDate(dateString: string): Promise<Date> {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    if (compareDates(formatDate(new Date()), formatDate(date)) >= 1) {
      throw new BadRequestException('Date must be in the future');
    }
    return date;
  }
}
