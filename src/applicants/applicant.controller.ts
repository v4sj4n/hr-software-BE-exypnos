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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantsService } from './/applicant.service';
import { FileMimeTypeValidationPipe } from 'src/common/pipes/file-mime-type-validation.pipe';

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

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Or 'photo' based on your input
  // @UsePipes(new FileMimeTypeValidationPipe())
  async handleApplicant(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: CreateApplicantDto,
    @Query('token') token?: string,
  ) {
    if (token) {
      // Handle the confirmation logic
      return await this.applicantsService.confirmApplication(token);
    } else {
      // Handle the creation logic
      return await this.applicantsService.createApplicant(file, formData);
    }
  }
  
  @Get()
  async handleApplicantConfirmation(@Query('token') token?: string) {
    if (token) {
      return await this.applicantsService.confirmApplication(token);
    }
    throw new BadRequestException('No token provided for confirmation.');
  }

}


  // @Patch(':id/send-custom-email')
  // async sendCustomEmail(
  //   @Param('id') id: string,
  //   @Body('customSubject') customSubject: string,
  //   @Body('customMessage') customMessage: string,
  // ) {
  //   await this.applicantsService.sendCustomEmail(
  //     id,
  //     customSubject,
  //     customMessage,
  //   );
  //   return { message: 'Custom email sent successfully' };
  // }

  // @Patch(':id/reschedule-interview')
  // async rescheduleInterview(
  //   @Param('id') id: string,
  //   @Body() updateApplicantDto: UpdateApplicantDto,
  // ) {
  //   try {
  //     const updatedApplicant = await this.applicantsService.rescheduleInterview(id, updateApplicantDto);

  //     return {
  //       message: 'Interview rescheduled successfully',
  //       applicant: updatedApplicant,
  //     };
  //   } catch (error) {
  //     console.error('Error rescheduling interview:', error.message);
  //     throw new ConflictException(error.message || 'Error rescheduling interview');
  //   }
  // }
