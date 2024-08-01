import {
  Injectable,
  ConflictException,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { Applicant } from 'src/common/schema/applicant.schema';
import * as admin from 'firebase-admin';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ApplicantStatus } from 'src/common/enum/applicantStatus.enum';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectModel(Applicant.name)
    private readonly applicantModel: Model<Applicant>,
    private readonly mailService: MailerService,
  ) {}
  private readonly dateDetails = {
    locale: 'sq',
    format: 'dd MMMM yyyy HH:mm',
  };

  async findAll(): Promise<Applicant[]> {
    return await this.applicantModel.find({
      isDeleted: false,
    });
  }

  async findOne(id: string): Promise<Applicant> {
    return await this.applicantModel.findById(id);
  }

  async createApplicant(
    file: Express.Multer.File,
    @Body() createApplicantDto: CreateApplicantDto,
  ) {
    try {
      const cvUrl = await this.uploadCv(file);
      const applicant = await this.applicantModel.create({
        ...createApplicantDto,
        cvAttachment: cvUrl,
      });
      await this.mailService.sendMail({
        from: process.env.MAIL_USERNAME,
        to: createApplicantDto.email,
        subject: 'Aplikimi u mor me sukses',
        template: './succesfulApplication',
        context: {
          name:
            createApplicantDto.firstName + ' ' + createApplicantDto.lastName,
        },
      });
      return applicant;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw new ConflictException('Failed to create applicant');
    }
  }

  async update(
    id: string,
    updateApplicantDto: UpdateApplicantDto,
  ): Promise<Applicant> {
    try {
      const applicationToUpdate = await this.applicantModel.findById(id);
      if (!applicationToUpdate) {
        throw new NotFoundException(`Applicant with id ${id} not found`);
      }
      if (updateApplicantDto.status === ApplicantStatus.REJECTED) {
        updateApplicantDto.interviewDate = null;
        await this.mailService.sendMail({
          from: process.env.MAIL_USERNAME,
          to: applicationToUpdate.email,
          subject: 'Na vjen keq',
          template: './rejectionApplicant',
          context: {
            name:
              applicationToUpdate.firstName +
              ' ' +
              applicationToUpdate.lastName,
          },
        });
      } else if (applicationToUpdate.interviewDate) {
        await this.mailService.sendMail({
          from: process.env.MAIL_USERNAME,
          to: applicationToUpdate.email,
          subject: 'Ndryshim planesh',
          template: './scheduleApplicantInterviewChange',
          context: {
            name:
              applicationToUpdate.firstName +
              ' ' +
              applicationToUpdate.lastName,
            oldDate: DateTime.fromISO(
              applicationToUpdate.interviewDate.toISOString(),
            )
              .setLocale(this.dateDetails.locale)
              .toFormat(this.dateDetails.format),
            newDate: DateTime.fromISO(updateApplicantDto.interviewDate)
              .setLocale(this.dateDetails.locale)
              .toFormat(this.dateDetails.format),
          },
        });
      } else if (updateApplicantDto.interviewDate) {
        updateApplicantDto.status = ApplicantStatus.ACCEPTED;
        await this.mailService.sendMail({
          from: process.env.MAIL_USERNAME,
          to: applicationToUpdate.email,
          subject: 'Intervista',
          template: './interview',
          context: {
            name:
              applicationToUpdate.firstName +
              ' ' +
              applicationToUpdate.lastName,
            date: DateTime.fromISO(updateApplicantDto.interviewDate)
              .setLocale(this.dateDetails.locale)
              .toFormat(this.dateDetails.format),
          },
        });
      }
      return await this.applicantModel.findByIdAndUpdate(
        id,
        updateApplicantDto,
        { new: true },
      );
    } catch (err) {
      console.log(err);
      throw new ConflictException(err);
    }
  }

  async create(createApplicantDto: CreateApplicantDto): Promise<Applicant> {
    const existingApplicant = await this.applicantModel.findOne({
      $or: [
        { email: createApplicantDto.email },
        { phoneNumber: createApplicantDto.phoneNumber },
      ],
    });

    if (existingApplicant) {
      throw new ConflictException(
        'Applicant with this email or phone number already exists',
      );
    }

    const createdApplicant = new this.applicantModel(createApplicantDto);

    return await createdApplicant.save();
  }
  async uploadCv(file: Express.Multer.File): Promise<string> {
    try {
      const bucket = admin.storage().bucket('gs://exypnos-63ca1.appspot.com');
      const fileName = `${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(`userCv/${fileName}`);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise<void>((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('Error in stream:', error);
          reject(new ConflictException('Failed to upload file'));
        });

        stream.on('finish', resolve);
        stream.end(file.buffer);
      });

      await fileUpload.makePublic();
      const publicUrl = fileUpload.publicUrl();
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new ConflictException('Failed to upload file');
    }
  }

  async deleteApplicant(id: string): Promise<Applicant> {
    const deletedApplicant = await this.applicantModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      { new: true },
    );
    if (!deletedApplicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }
    return deletedApplicant;
  }
}
