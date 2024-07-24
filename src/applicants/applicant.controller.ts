import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { ApplicantsService } from 'src/applicants/applicant.service';

@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('cvAttachment'))
  create(@Body() createApplicantDto: CreateApplicantDto, @UploadedFile() file: Express.Multer.File) {
    return this.applicantsService.create(createApplicantDto, file);
  }
}
