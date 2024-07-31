import { Controller, Post, Body, Param, Patch, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicantsService } from './applicant.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('applicants')
export class ApplicantController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('cvAttachment'))
  async create(
    @Body() createApplicantDto: CreateApplicantDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.applicantsService.create(createApplicantDto, file);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateApplicantDto: UpdateApplicantDto,
  ) {
    return this.applicantsService.update(id, updateApplicantDto);
  }

  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.applicantsService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/schedule')
  async scheduleInterview(
    @Param('id') id: string,
    @Body('interviewDate') interviewDate: string,
  ) {
    if (!interviewDate) {
      throw new BadRequestException('interviewDate must be provided');
    }

    const date = new Date(interviewDate);
    return this.applicantsService.scheduleInterview(id, date);
  }
}
