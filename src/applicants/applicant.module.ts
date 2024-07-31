import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Applicant, ApplicantSchema } from 'src/common/schema/applicant.schema';
import { ApplicantsService } from './applicant.service';
import { ApplicantController } from './applicant.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Applicant.name, schema: ApplicantSchema }]),
  ],
  controllers: [ApplicantController],
  providers: [ApplicantsService],
})
export class ApplicantsModule {}
