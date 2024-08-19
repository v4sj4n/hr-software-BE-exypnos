import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import {
  ApplicantPhase,
  ApplicantStatus,
  EmailType,
} from 'src/common/enum/applicant.enum';
import { MailService } from 'src/mail/mail.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import {
  Applicant,
  ApplicantDocument,
} from 'src/common/schema/applicant.schema';
import { Public } from 'src/common/decorator/public.decorator';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { DateTime } from 'luxon';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/common/enum/notification.enum';


@Injectable()
export class ApplicantsService {
  update: any;
  constructor(
    @InjectModel(Applicant.name)
    private applicantModel: Model<ApplicantDocument>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly firebaseService: FirebaseService,
    private readonly notificationService: NotificationService,
  ) {}

  async deleteApplicant(id: string): Promise<void> {
    const applicant = await this.findOne(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }
    applicant.isDeleted = true;
    await applicant.save();
  }
  async findAll(
    currentPhase?: string,
    status?: string,
    dateFilter?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Applicant[]> {
    try {
      const filter: any = {};

      if (currentPhase) {
        filter.currentPhase = currentPhase;
      }

      if (status) {
        filter.status = status;
      }
      if (startDate && endDate) {
        switch (dateFilter) {
          case 'firstInterviewDate':
            filter.firstInterviewDate = {
              $ne: null,
              $gte: startDate,
              $lte: endDate,
            };
            break;
          case 'secondInterviewDate':
            filter.secondInterviewDate = {
              $ne: null,
              $gte: startDate,
              $lte: endDate,
            };
            break;
          case 'createdAt':
            filter.createdAt = { $gte: startDate, $lte: endDate };
            filter.firstInterviewDate = null;
            filter.secondInterviewDate = null;
            break;
        }
      }

      return await this.applicantModel.find(filter).exec();
    } catch (error) {
      throw new Error('Failed to filter applicants');
    }
  }

  async findOne(id: string): Promise<ApplicantDocument> {
    const applicant = await this.applicantModel.findById(id).exec();
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }
    return applicant;
  }

  @Public()
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
        subject: 'Your application was received succesfully',
        template: 'successfulApplication',
        context: {
          name: createApplicantDto.firstName,
          positionApplied: createApplicantDto.positionApplied,
        },
      });

      await this.notificationService.createNotification(
        'New applicant',
        `New applicant ${createApplicantDto.firstName} ${createApplicantDto.lastName} has applied for the position of ${createApplicantDto.positionApplied}`,
        NotificationType.APPLICANT,
        new Types.ObjectId(applicant._id as string),
        new Date(),
      );

      return applicant;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw new ConflictException('Failed to create applicant');
    }
  }

  async updateApplicant(
    id: string,
    updateApplicantDto: UpdateApplicantDto,
  ): Promise<ApplicantDocument> {
    const applicant = await this.findOne(id);

    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }
    const currentDateTime = DateTime.now();

    if (updateApplicantDto.customSubject && updateApplicantDto.customMessage) {
      await this.sendEmail(
        applicant,
        EmailType.CUSTOM,
        updateApplicantDto.customSubject,
        updateApplicantDto.customMessage,
      );
    } else {
      if (updateApplicantDto.firstInterviewDate) {
        const firstInterviewDate = DateTime.fromJSDate(
          updateApplicantDto.firstInterviewDate,
        );
        if (firstInterviewDate <= currentDateTime) {
          throw new ConflictException(
            'First interview date and time must be in the future',
          );
        }
        await this.sendEmail(
          applicant,
          EmailType.FIRST_INTERVIEW,
          updateApplicantDto.customSubject,
          updateApplicantDto.customMessage,
        );
      }

      if (updateApplicantDto.secondInterviewDate) {
        const secondInterviewDate = DateTime.fromJSDate(
          updateApplicantDto.secondInterviewDate,
        );
        if (secondInterviewDate <= currentDateTime) {
          throw new ConflictException(
            'Second interview date and time must be in the future',
          );
        }
        applicant.secondInterviewDate = secondInterviewDate.toJSDate();
        applicant.currentPhase = ApplicantPhase.SECOND_INTERVIEW;
        await this.sendEmail(
          applicant,
          EmailType.SECOND_INTERVIEW,
          updateApplicantDto.customSubject,
          updateApplicantDto.customMessage,
        );
      }

      if (updateApplicantDto.status) {
        applicant.status = updateApplicantDto.status;
        if (updateApplicantDto.status === ApplicantStatus.REJECTED) {
          await this.sendEmail(
            applicant,
            EmailType.REJECTED_APPLICATION,
            updateApplicantDto.customSubject,
            updateApplicantDto.customMessage,
          );
        }
      }
    }
    if (updateApplicantDto.notes) {
      applicant.notes = updateApplicantDto.notes;
    }

    Object.assign(applicant, updateApplicantDto);
    return await applicant.save();
  }

  private async sendEmail(
    applicant: ApplicantDocument,
    emailType: EmailType,
    customSubject?: string,
    customMessage?: string,
    isReschedule: boolean = false,
  ): Promise<void> {
    let subject: string;
    let template: string;
    const context: any = {
      name: `${applicant.firstName} ${applicant.lastName}`,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      positionApplied: applicant.positionApplied,
    };

    switch (emailType) {
      case EmailType.FIRST_INTERVIEW:
        subject = isReschedule
          ? 'Interview Rescheduled - First Phase'
          : 'Interview Scheduled - First Phase';
        template = isReschedule
          ? 'interview-rescheduled'
          : 'interview-scheduled';
        context.interviewDate = applicant.firstInterviewDate.toLocaleString(
          'sq',
          {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          },
        );
        context.phase = 'first';
        break;

      case EmailType.SECOND_INTERVIEW:
        subject = isReschedule
          ? 'Interview Rescheduled - Second Phase'
          : 'Interview Scheduled - Second Phase';
        template = isReschedule
          ? 'interview-rescheduled'
          : 'interview-scheduled';
        context.interviewDate = applicant.secondInterviewDate.toLocaleString(
          'sq',
          {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          },
        );
        context.phase = 'second';
        break;

      case EmailType.SUCCESSFUL_APPLICATION:
        subject = 'Application Received Successfully';
        template = 'successfulApplication';
        break;

      case EmailType.REJECTED_APPLICATION:
        subject = 'Application Status - Rejected';
        template = 'application-rejected';
        break;

      case EmailType.CUSTOM:
        if (!customSubject || !customMessage) {
          throw new ConflictException(
            'Custom subject and message are required for a custom email.',
          );
        }
        subject = customSubject;
        template = 'custom-email';
        context.customMessage = customMessage;
        break;

      default:
        throw new ConflictException('Invalid email type');
    }

    context.subject = subject;

    await this.mailService.sendMail({
      to: applicant.email,
      subject: subject,
      template: template,
      context: context,
    });
  }

  async rescheduleInterview(
    id: string,
    updateApplicantDto: UpdateApplicantDto,
  ): Promise<ApplicantDocument> {
    const applicant = await this.findOne(id);
    const now = DateTime.now();
    if (updateApplicantDto.customSubject && updateApplicantDto.customMessage) {
      await this.sendEmail(
        applicant,
        EmailType.CUSTOM,
        updateApplicantDto.customSubject,
        updateApplicantDto.customMessage,
      );
    } else {
      if (updateApplicantDto.firstInterviewDate) {
        const firstInterviewDate = DateTime.fromJSDate(updateApplicantDto.firstInterviewDate);
        if (firstInterviewDate < now) {
          throw new ConflictException('First interview date cannot be in the past.');
        }     
          applicant.firstInterviewDate = updateApplicantDto.firstInterviewDate;
          applicant.currentPhase = ApplicantPhase.FIRST_INTERVIEW;
          await this.sendEmail(
            applicant,
            EmailType.FIRST_INTERVIEW,
            updateApplicantDto.customSubject,
            updateApplicantDto.customMessage,
            true,
          );
      } else if (updateApplicantDto.secondInterviewDate) {
        const secondInterviewDate = DateTime.fromJSDate(updateApplicantDto.secondInterviewDate);
        if (secondInterviewDate < now) {
          throw new ConflictException('Second interview date cannot be in the past.');
        }
        applicant.secondInterviewDate = updateApplicantDto.secondInterviewDate;
        applicant.currentPhase = ApplicantPhase.SECOND_INTERVIEW;
        await this.sendEmail(
          applicant,
          EmailType.SECOND_INTERVIEW,
          updateApplicantDto.customSubject,
          updateApplicantDto.customMessage,
          true,
        );
      }

      return await applicant.save();
    }
  }
  async sendCustomEmail(
    id: string,
    customSubject: string,
    customMessage: string,
  ): Promise<void> {
    const applicant = await this.findOne(id);
    await this.sendEmail(
      applicant,
      EmailType.CUSTOM,
      customSubject,
      customMessage,
    );
  }
  async filterApplicants(
    phase?: ApplicantPhase,
    status?: ApplicantStatus,
    startDate?: string,
    endDate?: string,
  ): Promise<Applicant[]> {
    const filter: any = {
      isDeleted: false,
    };

    if (phase) {
      filter.currentPhase = phase;
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    return await this.applicantModel.find(filter).exec();
  }
}
