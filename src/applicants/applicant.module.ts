import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Applicant, ApplicantSchema } from '../common/schema/applicant.schema';
import { ApplicantsController } from './applicant.controller';
import { ApplicantsService } from './applicant.service';

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
