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
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantStatus } from 'src/common/enum/applicantStatus.enum';
import { MailService } from 'src/mail/mail.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectModel(Applicant.name)
    private readonly applicantModel: Model<Applicant>,
    private readonly mailService: MailService,
    private readonly firebaseService: FirebaseService,
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
      const cvUrl = await this.firebaseService.uploadFile(file, 'cv');
      const applicant = await this.applicantModel.create({
        ...createApplicantDto,
        cvAttachment: cvUrl,
      });
      await this.mailService.sendMail({
        to: applicant.email,
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
            message: updateApplicantDto.message || '',
          },
        });
      }
      if (updateApplicantDto.message) {
        const { message, ...rest } = updateApplicantDto;
        console.log(message);
        return await this.applicantModel.findByIdAndUpdate(id, rest, {
          new: true,
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
