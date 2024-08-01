import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Applicant, ApplicantSchema } from 'src/common/schema/applicant.schema';
import { ApplicantsService } from './applicant.service';
import { ApplicantsController } from './applicant.controller';
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
  controllers: [ApplicantsController],
  providers: [ApplicantsService],
})
export class ApplicantsModule {}
