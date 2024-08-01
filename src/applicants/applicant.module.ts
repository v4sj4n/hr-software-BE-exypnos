import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicantsService } from './applicant.service';
import { ApplicantsController } from './applicant.controller';
import { Applicant, ApplicantSchema } from '../common/schema/applicant.schema';
import { MailModule } from 'src/mail/mail.module';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Applicant.name, schema: ApplicantSchema },
    ]),
    MailModule,
    FirebaseModule,
  ],
  providers: [ApplicantsService],
  controllers: [ApplicantsController],
})
export class ApplicantsModule {}
