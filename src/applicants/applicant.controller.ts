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
  ConflictException,
  UsePipes,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantsService } from './/applicant.service';
import { FileMimeTypeValidationPipe } from 'src/common/pipes/file-mime-type-validation.pipe';
import { Response } from 'express';
import { Express } from 'express';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('applicant')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Get()
  async findAll(
    @Query('currentPhase') currentPhase: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return await this.applicantsService.findAll(
      currentPhase,
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
    try {
      const updatedApplicant = await this.applicantsService.updateApplicant(
        id,
        updateApplicantDto,
      );
      return {
        message: 'Applicant updated successfully',
        applicant: updatedApplicant,
      };
    } catch (error) {
      throw new ConflictException(error.message || 'Error updating applicant');
    }
  }

  @Delete(':id')
  async deleteApplicant(@Param('id') id: string) {
    await this.applicantsService.deleteApplicant(id);
    return { message: 'Applicant deleted successfully' };
  }


  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('file')) 
  @UsePipes(new FileMimeTypeValidationPipe()) 
  async handleApplicant(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: CreateApplicantDto,
    @Query('token') token?: string, 
  ) {
    if (token) {
      return await this.applicantsService.confirmApplication(token);
    } else {
      return await this.applicantsService.createApplicant(file, formData);
    }
  }

@Public()
@Get('confirm')
async handleApplicantConfirmation(
  @Query('token') token: string,
  @Res() res: Response,
) {
  await this.applicantsService.confirmApplication(token);  
  return res.redirect('/confirmation-success');  
}
}

