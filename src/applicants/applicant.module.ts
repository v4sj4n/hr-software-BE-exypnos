import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicantsService } from 'src/applicants/applicant.service';
import { ApplicantsController } from 'src/applicants/applicant.controller';
import { Applicant, ApplicantSchema } from 'src/common/schema/applicant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Applicant.name, schema: ApplicantSchema }]),
  ],
  controllers: [ApplicantsController],
  providers: [ApplicantsService],
})
export class ApplicantsModule {}
