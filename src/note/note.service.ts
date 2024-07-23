import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from '../common/schema/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NoteService {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const createdNote = new this.noteModel(createNoteDto);
    createdNote.date = await this.checkDate(createNoteDto.date);
    return createdNote.save();
  }

  async findAll(): Promise<Note[]> {
    return this.noteModel.find().exec();
  }

  async findOne(id: string): Promise<Note> {
    return this.noteModel.findById(id).exec();
  }

  async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    updateNoteDto.date = await this.checkDate(updateNoteDto.date);
    return this.noteModel
      .findByIdAndUpdate(id, updateNoteDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Note> {
    return this.noteModel.findByIdAndDelete(id).exec();
  }


  private async checkDate(date: Date | undefined): Promise<Date> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  

    if (!date) {
      return new Date(); 
    }

    const providedDate = new Date(date);
    providedDate.setHours(0, 0, 0, 0);  

    if (providedDate < today) {
      throw new BadRequestException('Date cannot be before today');
    }

    return providedDate;
  }
}

