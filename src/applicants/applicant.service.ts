import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantStatus } from 'src/common/enum/applicantStatus.enum';
import { MailService } from 'src/mail/mail.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AddInterviewNoteDto } from './dto/add-interview-note.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import {
  Applicant,
  ApplicantDocument,
} from 'src/common/schema/applicant.schema';
import { SendCustomEmailDto } from './dto/send-custom-email.dto';

@Injectable()
export class ApplicantsService {
  deleteApplicant(id: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Applicant.name)
    private readonly applicantModel: Model<ApplicantDocument>,
    private readonly mailService: MailService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async findAll(): Promise<Applicant[]> {
    return await this.applicantModel.find({ isDeleted: false }).exec();
  }

  async findOne(id: string): Promise<ApplicantDocument> {
    const applicant = await this.applicantModel.findById(id).exec();
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }
    return applicant;
  }

  async filterByDateRange(
    startDate: string,
    endDate: string,
    phase?: 'first' | 'second',
  ): Promise<Applicant[]> {
    const query: any = {
      isDeleted: false,
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };

    if (phase) {
      if (phase === 'first') {
        query.firstInterviewDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      } else if (phase === 'second') {
        query.secondInterviewDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
    }

    return await this.applicantModel.find(query).exec();
  }

  async createApplicant(
    file: Express.Multer.File,
    createApplicantDto: CreateApplicantDto,
  ): Promise<Applicant> {
    try {
      const cvUrl = await this.firebaseService.uploadFile(file, 'cv');
      const applicant = await this.applicantModel.create({
        ...createApplicantDto,
        cvAttachment: cvUrl,
        status: ApplicantStatus.PENDING,
      });
      await this.mailService.sendMail({
        to: createApplicantDto.email,
        subject: 'Aplikimi u mor me sukses',
        template: './successfulApplication',
        context: {
          name: `${createApplicantDto.firstName} ${createApplicantDto.lastName}`,
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
      const applicationToUpdate = await this.findOne(id);
      if (!applicationToUpdate) {
        throw new NotFoundException(`Applicant with id ${id} not found`);
      }
      if (updateApplicantDto.status === ApplicantStatus.REJECTED) {
        updateApplicantDto.interviewDate = null;
        await this.sendRejectEmail(applicationToUpdate);
      } else if (applicationToUpdate.interviewDate) {
        const oldDate = new Date(
          applicationToUpdate.interviewDate,
        ).toLocaleString('sq', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const newDate = new Date(
          updateApplicantDto.interviewDate,
        ).toLocaleString('sq', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        await this.mailService.sendMail({
          to: applicationToUpdate.email, // Applicant's email address
          subject: 'Ndryshim planesh',
          template: './scheduleApplicantInterviewChange',
          context: {
            name: `${applicationToUpdate.firstName} ${applicationToUpdate.lastName}`,
            oldDate,
            newDate,
          },
        });
      } else if (updateApplicantDto.interviewDate) {
        updateApplicantDto.status = ApplicantStatus.ACCEPTED;
        const interviewDate = new Date(
          updateApplicantDto.interviewDate,
        ).toLocaleString('sq', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        await this.mailService.sendMail({
          to: applicationToUpdate.email,
          subject: 'Intervista',
          template: './interview',
          context: {
            name: `${applicationToUpdate.firstName} ${applicationToUpdate.lastName}`,
            date: interviewDate,
            message: updateApplicantDto.message || '',
          },
        });
      }
      if (updateApplicantDto.message) {
        const { message, ...rest } = updateApplicantDto;
        return await this.applicantModel
          .findByIdAndUpdate(id, rest, { new: true })
          .exec();
      }
      return await this.applicantModel
        .findByIdAndUpdate(id, updateApplicantDto, { new: true })
        .exec();
    } catch (err) {
      console.error(err);
      throw new ConflictException(err);
    }
  }

  async addInterviewNote(
    id: string,
    addInterviewNoteDto: AddInterviewNoteDto,
  ): Promise<ApplicantDocument> {
    const { phase, note } = addInterviewNoteDto;
    const applicant = await this.findOne(id);
    if (!applicant.notes) {
      applicant.notes = '';
    }
    applicant.notes += `\n${phase} phase note: ${note}`;
    await applicant.save();
    return applicant;
  }

  async updateInterviewStatus(
    id: string,
    updateInterviewStatusDto: UpdateInterviewStatusDto,
  ): Promise<ApplicantDocument> {
    const { phase, status, interviewDate } = updateInterviewStatusDto;
    const applicant = await this.findOne(id);
    if (!applicant.notes) {
      applicant.notes = '';
    }

    if (status === 'accepted') {
      applicant.notes += `\n${phase} phase accepted`;
      if (interviewDate) {
        if (phase === 'first') {
          applicant.firstInterviewDate = new Date(interviewDate);
        } else if (phase === 'second') {
          applicant.secondInterviewDate = new Date(interviewDate);
        }
      }
      if (phase === 'first') {
        await this.sendSecondInterviewEmail(applicant, new Date(interviewDate));
      }
    } else if (status === 'rejected') {
      applicant.notes += `\n${phase} phase rejected`;
      if (phase === 'first') {
        await this.sendRejectEmail(applicant);
      }
    }

    await applicant.save();
    return applicant;
  }

  async scheduleInterview(
    id: string,
    scheduleInterviewDto: ScheduleInterviewDto,
  ): Promise<ApplicantDocument> {
    const { phase, interviewDate, notes } = scheduleInterviewDto;
    const applicant = await this.findOne(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }

    if (phase === 'applicant') {
      applicant.interviewDate = new Date(interviewDate);
      applicant.currentPhase = 'applicant';
    } else if (phase === 'first') {
      applicant.firstInterviewDate = new Date(interviewDate);
      applicant.currentPhase = 'first';
    } else if (phase === 'second') {
      applicant.secondInterviewDate = new Date(interviewDate);
      applicant.currentPhase = 'second';
    } else {
      throw new ConflictException('Invalid phase provided for scheduling.');
    }

    if (notes) {
      if (!applicant.notes) {
        applicant.notes = '';
      }
      applicant.notes += `\n${phase} phase note: ${notes}`;
    }

    await this.mailService.sendMail({
      to: applicant.email,
      subject: `Interview Scheduled - ${phase} phase`,
      template: './interview-scheduled',
      context: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        interviewDate: new Date(interviewDate).toLocaleString('sq', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        phase,
      },
    });

    await applicant.save();
    return applicant;
  }

  async rescheduleInterview(
    id: string,
    rescheduleInterviewDto: RescheduleInterviewDto,
  ): Promise<ApplicantDocument> {
    const { phase, newInterviewDate } = rescheduleInterviewDto;
    const applicant = await this.findOne(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }

    if (phase === 'applicant') {
      applicant.interviewDate = new Date(newInterviewDate);
      applicant.currentPhase = 'applicant';
    } else if (phase === 'first') {
      applicant.firstInterviewDate = new Date(newInterviewDate);
      applicant.currentPhase = 'first';
    } else if (phase === 'second') {
      applicant.secondInterviewDate = new Date(newInterviewDate);
      applicant.currentPhase = 'second';
    } else {
      throw new ConflictException('Invalid phase provided for rescheduling.');
    }

    await this.mailService.sendMail({
      to: applicant.email,
      subject: `Interview Rescheduled - ${phase} phase`,
      template: './interview-rescheduled',
      context: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        newInterviewDate: new Date(newInterviewDate).toLocaleString('sq', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        phase,
      },
    });

    await applicant.save();
    return applicant;
  }

  async updateApplicantStatus(
    id: string,
    status: ApplicantStatus,
  ): Promise<ApplicantDocument> {
    const applicant = await this.findOne(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }

    applicant.status = status;
    await applicant.save();
    return applicant;
  }

  private async sendSecondInterviewEmail(
    applicant: ApplicantDocument,
    interviewDate?: Date,
  ): Promise<void> {
    await this.mailService.sendMail({
      to: applicant.email,
      subject: 'Second Interview Scheduled',
      template: './second-interview',
      context: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        interviewDate: interviewDate
          ? new Date(interviewDate).toLocaleString('sq', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : null,
      },
    });
  }

  private async sendRejectEmail(applicant: ApplicantDocument): Promise<void> {
    await this.mailService.sendMail({
      to: applicant.email,
      subject: 'Application Rejected',
      template: './reject',
      context: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
      },
    });
  }

  async sendCustomEmail(
    id: string,
    sendCustomEmailDto: SendCustomEmailDto,
  ): Promise<void> {
    const applicant = await this.findOne(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }

    const { subject, message } = sendCustomEmailDto;

    await this.mailService.sendMail({
      to: applicant.email,
      subject,
      html: `<p>${message}</p>`,
    });
  }
}
