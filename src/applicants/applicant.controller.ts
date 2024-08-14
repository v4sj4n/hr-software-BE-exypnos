import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantsService } from './/applicant.service';

@Controller('applicant')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Get()
  async findAll(
    @Query('currentPhase') currentPhase: string,
    @Query('status') status: string,
    @Query('dateFilter') dateFilter: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return await this.applicantsService.findAll(
      currentPhase,
      status,
      dateFilter,
      startDate,
      endDate,
    );
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
    return await this.applicantsService.updateApplicant(id, updateApplicantDto);
  }

  @Delete(':id')
  async deleteApplicant(@Param('id') id: string) {
    await this.applicantsService.deleteApplicant(id);
    return { message: 'Applicant deleted successfully' };
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createApplicant(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: CreateApplicantDto,
  ) {
    return await this.applicantsService.createApplicant(file, formData);
  }

  @Patch(':id/send-custom-email')
  async sendCustomEmail(
    @Param('id') id: string,
    @Body('customSubject') customSubject: string,
    @Body('customMessage') customMessage: string,
  ) {
    await this.applicantsService.sendCustomEmail(
      id,
      customSubject,
      customMessage,
    );
    return { message: 'Custom email sent successfully' };
  }

  @Patch(':id/reschedule-interview')
  async rescheduleInterview(
    @Param('id') id: string,
    @Body() updateApplicantDto: UpdateApplicantDto,
  ) {
    const updatedApplicant = await this.applicantsService.rescheduleInterview(
      id,
      updateApplicantDto,
    );
    return {
      message: 'Interview rescheduled successfully',
      applicant: updatedApplicant,
    };
  }
}
