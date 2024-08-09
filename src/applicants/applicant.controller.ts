import {
  Controller,
  Get,
  Query,
  Param,
  Patch,
  Post,
  Body,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorator/public.decorator';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantsService } from './applicant.service';
import { AddInterviewNoteDto } from './dto/add-interview-note.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { SendCustomEmailDto } from './dto/send-custom-email.dto';
import { ApplicantStatus } from 'src/common/enum/applicantStatus.enum';

@Controller('applicant')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Get('filter')
  async filterByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('phase') phase?: 'first' | 'second',
  ) {
    return await this.applicantsService.filterByDateRange(
      startDate,
      endDate,
      phase,
    );
  }

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
  deleteApplicant(@Param('id') id: string) {
    return this.applicantsService.deleteApplicant(id);
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
  addInterviewNote(
    @Param('id') id: string,
    @Body() addInterviewNoteDto: AddInterviewNoteDto,
  ) {
    return this.applicantsService.addInterviewNote(id, addInterviewNoteDto);
  }

  @Patch(':id/interview/schedule')
  async scheduleInterview(
    @Param('id') id: string,
    @Body() scheduleInterviewDto: ScheduleInterviewDto,
  ) {
    return await this.applicantsService.scheduleInterview(
      id,
      scheduleInterviewDto,
    );
  }

  @Patch(':id/interview/reschedule')
  async rescheduleInterview(
    @Param('id') id: string,
    @Body() rescheduleInterviewDto: RescheduleInterviewDto,
  ) {
    return await this.applicantsService.rescheduleInterview(
      id,
      rescheduleInterviewDto,
    );
  }

  @Post(':id/send-email')
  async sendCustomEmail(
    @Param('id') id: string,
    @Body() sendCustomEmailDto: SendCustomEmailDto,
  ) {
    return this.applicantsService.sendCustomEmail(id, sendCustomEmailDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicantStatus,
  ) {
    return await this.applicantsService.updateApplicantStatus(id, status);
  }
}
