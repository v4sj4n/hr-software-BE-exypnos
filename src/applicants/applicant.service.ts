import { Body, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as admin from 'firebase-admin';
import { Model } from 'mongoose';
import { Applicant } from 'src/common/schema/applicant.schema';

import { CreateApplicantDto } from './dto/create-applicant.dto';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectModel(Applicant.name)
    private readonly applicantModel: Model<Applicant>,
  ) {}

  async getAllApplicants(): Promise<Applicant[]> {
    return await this.applicantModel.find();
  }
  async createApplicant(
    file: Express.Multer.File,
    @Body() createApplicantDto: CreateApplicantDto,
  ) {
    try {
      const applicant = await this.applicantModel.create(createApplicantDto);
      const cvUrl = await this.uploadCv(file);

      applicant.cvAttachment = cvUrl;
      await applicant.save();
      return applicant;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw new ConflictException('Failed to create applicant');
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

    // No file handling here
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
}
