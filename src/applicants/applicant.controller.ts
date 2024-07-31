import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { ApplicantsService } from 'src/applicants/applicant.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorator/public.decorator';
import { CreateApplicantDto } from './dto/create-applicant.dto';

@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Get()
  async findAll() {
    return await this.applicantsService.findAll();
  }

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: CreateApplicantDto,
  ) {
    return await this.applicantsService.createApplicant(file, formData);
  }
}
