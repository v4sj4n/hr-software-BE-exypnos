import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Applicant, ApplicantDocument } from 'src/common/schema/applicant.schema';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectModel(Applicant.name) private readonly applicantModel: Model<ApplicantDocument>,
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
      const bucket = admin.storage().bucket();
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

    const createdApplicant = new this.applicantModel(createApplicantDto);
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
    return updatedApplicant;
  }

  async remove(id: string): Promise<void> {
    const result = await this.applicantModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }
  }
}
