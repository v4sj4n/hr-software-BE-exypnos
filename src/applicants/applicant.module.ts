import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicantsService } from './applicants.service';
import { ApplicantsController } from './applicants.controller';
import { Applicant, ApplicantSchema } from '../common/schemas/applicant.schema';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Applicant.name, schema: ApplicantSchema }]),
    StorageModule, // Import StorageModule here
  ],
  providers: [ApplicantsService],
  controllers: [ApplicantsController],
})
export class ApplicantsModule {}
