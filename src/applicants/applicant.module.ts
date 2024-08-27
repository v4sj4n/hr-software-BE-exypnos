import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Applicant, ApplicantSchema } from 'src/common/schema/applicant.schema';
import { ApplicantsService } from './applicant.service';
import { ApplicantsController } from './applicant.controller';
import { MailModule } from 'src/mail/mail.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { RecaptchaService } from 'src/common/recaptcha/recaptcha.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Applicant.name, schema: ApplicantSchema },
    ]),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLER_TTL', 60),  
            limit: config.get<number>('THROTTLER_LIMIT', 10), 
          },
        ],
      }),
    }),
    MailModule,
    FirebaseModule,
    AuthModule,
    NotificationModule,
  ],
  controllers: [ApplicantsController],
  providers: [ApplicantsService, RecaptchaService],
})
export class ApplicantsModule {}
