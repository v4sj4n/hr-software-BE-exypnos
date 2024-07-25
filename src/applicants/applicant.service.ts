import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { Applicant, ApplicantDocument } from 'src/common/schema/applicant.schema';
import * as admin from 'firebase-admin';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectModel(Applicant.name) private readonly applicantModel: Model<ApplicantDocument>,
  ) {}

  async create(createApplicantDto: CreateApplicantDto): Promise<Applicant> {
    const existingApplicant = await this.applicantModel.findOne({
      $or: [
        { email: createApplicantDto.email },
        { phoneNumber: createApplicantDto.phoneNumber },
      ],
    });

    if (existingApplicant) {
      throw new ConflictException('Applicant with this email or phone number already exists');
    }

    // No file handling here
    const createdApplicant = new this.applicantModel(createApplicantDto);
    
    return await createdApplicant.save();
  }
  async uploadCv(file: Express.Multer.File, req: Request): Promise<string> {
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
