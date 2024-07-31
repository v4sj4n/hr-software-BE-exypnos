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

@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: any,
  ) {
    return await this.applicantsService.createApplicant(file, formData);
  }

  @Get()
  async getAllApplicants() {
    return await this.applicantsService.getAllApplicants();
  }
}
