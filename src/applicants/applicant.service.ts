import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { Applicant, ApplicantDocument } from '../common/schemas/applicant.schema';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectModel(Applicant.name) private readonly applicantModel: Model<ApplicantDocument>,
    private readonly storageService: StorageService,
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
      const cvAttachment = await this.storageService.uploadFile(file);
      createApplicantDto.cvAttachment = cvAttachment;
    }

    const createdApplicant = new this.applicantModel(createApplicantDto);
    return await createdApplicant.save();
  }
}
