import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Applicant, ApplicantDocument } from 'src/common/schema/applicant.schema';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectModel(Applicant.name) private readonly applicantModel: Model<ApplicantDocument>,
    private readonly mailerService: MailerService,
  ) {}

  async create(createApplicantDto: CreateApplicantDto, file?: Express.Multer.File): Promise<Applicant> {
    const existingApplicant = await this.applicantModel.findOne({
      $or: [
        { email: createApplicantDto.email },
        { phoneNumber: createApplicantDto.phoneNumber },
      ],
    });

    if (existingApplicant) {
      throw new ConflictException('Applicant with this email or phone number already exists');
    }

    if (file) {
      const bucket = admin.storage().bucket('gs://exypnos-63ca1.appspot.com');
      const fileName = `${uuidv4()}_${file.originalname}`;
      const fileUpload = bucket.file(fileName);
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
      createApplicantDto.cvAttachment = fileUpload.publicUrl();
    }

    const createdApplicant = new this.applicantModel({
      ...createApplicantDto,
      status: 'pending', // Default status
    });
    return createdApplicant.save();
  }

  async findAll(): Promise<Applicant[]> {
    return this.applicantModel.find().exec();
  }

  async findOne(id: string): Promise<Applicant> {
    const applicant = await this.applicantModel.findById(id).exec();
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }
    return applicant;
  }

  async update(id: string, updateApplicantDto: UpdateApplicantDto): Promise<Applicant> {
    const updatedApplicant = await this.applicantModel.findByIdAndUpdate(id, updateApplicantDto, { new: true }).exec();
    if (!updatedApplicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }
    return updatedApplicant;
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<Applicant> {
    const updatedApplicant = await this.applicantModel.findByIdAndUpdate(id, updateStatusDto, { new: true }).exec();
    if (!updatedApplicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }

    if (updateStatusDto.status === 'accepted') {
      await this.sendAcceptEmail(updatedApplicant.email);
    } else if (updateStatusDto.status === 'rejected') {
      await this.sendRejectEmail(updatedApplicant.email);
    }

    return updatedApplicant;
  }

  async remove(id: string): Promise<void> {
    const result = await this.applicantModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }
  }

  private async sendAcceptEmail(email: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Application Accepted',
      template: './accept',
      context: {
        email: email,
      },
    });
  }

  private async sendRejectEmail(email: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Application Rejected',
      template: './reject',
      context: {
        email: email,
      },
    });
  }

  async scheduleInterview(id: string, date: Date): Promise<void> {
    const applicant = await this.findOne(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }

    if (applicant.status !== 'accepted') {
      throw new ConflictException('Cannot schedule an interview for an applicant that has not been accepted');
    }

    const updatedApplicant = await this.applicantModel.findByIdAndUpdate(id, { interviewDate: date.toISOString() }, { new: true }).exec();

    setTimeout(async () => {
      await this.mailerService.sendMail({
        to: updatedApplicant.email,
        subject: 'Interview Scheduled',
        template: './schedule',
        context: {
          email: updatedApplicant.email,
          date: date.toISOString(),
        },
      });
    }, date.getTime() - Date.now());
  }
}
