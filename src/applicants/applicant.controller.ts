import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
  Get,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorator/public.decorator';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantsService } from './applicant.service';
import { AddInterviewNoteDto } from './dto/add-interview-note.dto'; 
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { UpdateEmploymentStatusDto } from './dto/update-employment-status.dto';

import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { SendCustomEmailDto } from 'src/applicants/dto/send-custom-email.dto'; 




@Controller('applicant')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Get()
  async findAll() {
    return await this.applicantsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.applicantsService.findOne(id);
  }

  @Patch(':id')
  async updateApplicant(
    @Param('id') id: string,
    @Body() updateApplicantDto: UpdateApplicantDto,
  ) {
    return await this.applicantsService.update(id, updateApplicantDto);
  }

  @Delete(':id')
  async deleteApplicant(@Param('id') id: string) {
    return await this.applicantsService.deleteApplicant(id);
  }

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createApplicant(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: CreateApplicantDto,
  ) {
    return await this.applicantsService.createApplicant(file, formData);
  }

  @Patch(':id/interview/note')
  addInterviewNote(@Param('id') id: string, @Body() addInterviewNoteDto: AddInterviewNoteDto) {
    return this.applicantsService.addInterviewNote(id, addInterviewNoteDto); // Correct the service name
  }

  @Patch(':id/interview/status')
  updateInterviewStatus(@Param('id') id: string, @Body() updateInterviewStatusDto: UpdateInterviewStatusDto) {
    return this.applicantsService.updateInterviewStatus(id, updateInterviewStatusDto); // Correct the service name
  }

  @Patch(':id/employment-status')
  async updateEmploymentStatus(@Param('id') id: string, @Body() updateEmploymentStatusDto: UpdateEmploymentStatusDto) {
    return this.applicantsService.updateEmploymentStatus(id, updateEmploymentStatusDto); 
  }

  @Patch(':id/interview/schedule')
  async scheduleInterview(
    @Param('id') id: string,
    @Body() scheduleInterviewDto: ScheduleInterviewDto
  ) {
    return await this.applicantsService.scheduleInterview(id, scheduleInterviewDto);
  }

  @Patch(':id/interview/reschedule')
  async rescheduleInterview(
    @Param('id') id: string,
    @Body() rescheduleInterviewDto: RescheduleInterviewDto
  ) {
    return await this.applicantsService.rescheduleInterview(id, rescheduleInterviewDto);
  }
  @Post(':id/send-email')
  async sendCustomEmail(@Param('id') id: string, @Body() sendCustomEmailDto: SendCustomEmailDto) {
    return this.applicantsService.sendCustomEmail(id, sendCustomEmailDto);
  }
}
