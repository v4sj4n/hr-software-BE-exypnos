import { Controller, Post, Body, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { ApplicantsService } from 'src/applicants/applicant.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Post()
  create(@Body() createApplicantDto: CreateApplicantDto) {
    return this.applicantsService.create(createApplicantDto);
  }

@Post('upload-cv')
@UseInterceptors(FileInterceptor('file'))
async uploadCv(
  @UploadedFile() file: Express.Multer.File,
  @Req() req: Request,
) {
  return this.applicantsService.uploadCv(file, req);
}
}
