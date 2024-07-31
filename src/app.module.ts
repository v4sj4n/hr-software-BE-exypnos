import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerConfig } from 'src/common/config/mailer.config'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicantsModule } from './applicants/applicant.module';
import { SalaryModule } from './salary/salary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MailerConfig, // Use the MailerConfig here
    ApplicantsModule,
    SalaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
