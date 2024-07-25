import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicantsService } from './applicant.service';
import { ApplicantsController } from './applicant.controller';
import { Applicant, ApplicantSchema } from '../common/schema/applicant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Applicant.name, schema: ApplicantSchema },
    ]),
  ],
  providers: [ApplicantsService],
  controllers: [ApplicantsController],
})
export class ApplicantsModule {}
