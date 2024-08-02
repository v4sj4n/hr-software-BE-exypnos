import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateTime } from 'luxon';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { ApplicantStatus } from 'src/common/enum/applicantStatus.enum';
import { MailService } from 'src/mail/mail.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AddInterviewNoteDto } from './dto/add-interview-note.dto';
import { UpdateInterviewStatusDto } from './dto/update-interview-status.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { UpdateEmploymentStatusDto } from './dto/update-employment-status.dto';
import { Applicant, ApplicantDocument } from 'src/common/schema/applicant.schema';
import { SendCustomEmailDto } from 'src/applicants/dto/send-custom-email.dto'; 


@Injectable()
export class ApplicantsService {
  deleteApplicant(id: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Applicant.name) private readonly applicantModel: Model<ApplicantDocument>,
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

  async createApplicant(
    file: Express.Multer.File,
    createApplicantDto: CreateApplicantDto,
  ): Promise<Applicant> {
    try {
      const cvUrl = await this.firebaseService.uploadFile(file, 'cv');
      const applicant = await this.applicantModel.create({
        ...createApplicantDto,
        cvAttachment: cvUrl,
        status: ApplicantStatus.PENDING, // Assuming this is the initial status
      });
      await this.mailService.sendMail({
        to: 'rediballa1@gmail.com', // Change this to your email address
        subject: 'Aplikimi u mor me sukses',
        template: './succesfulApplication',
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
        const oldDate = DateTime.fromISO(applicationToUpdate.interviewDate.toISOString())
          .setLocale('sq')
          .toFormat('dd MMMM yyyy HH:mm');
        const newDate = DateTime.fromISO(updateApplicantDto.interviewDate)
          .setLocale('sq')
          .toFormat('dd MMMM yyyy HH:mm');

        await this.mailService.sendMail({
          to: 'rediballa1@gmail.com', // Change this to your email address
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
        const interviewDate = DateTime.fromISO(updateApplicantDto.interviewDate)
          .setLocale('sq')
          .toFormat('dd MMMM yyyy HH:mm');

        await this.mailService.sendMail({
          to: 'rediballa1@gmail.com', // Change this to your email address
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
        console.log(message);
        return await this.applicantModel.findByIdAndUpdate(id, rest, { new: true }).exec();
      }
      return await this.applicantModel.findByIdAndUpdate(id, updateApplicantDto, { new: true }).exec();
    } catch (err) {
      console.error(err);
      throw new ConflictException(err);
    }
  }

  async addInterviewNote(id: string, addInterviewNoteDto: AddInterviewNoteDto): Promise<ApplicantDocument> {
    const { phase, note } = addInterviewNoteDto;
    const applicant = await this.findOne(id);
    if (!applicant.notes) {
      applicant.notes = '';
    }
    applicant.notes += `\n${phase} phase note: ${note}`;
    await applicant.save();
    return applicant;
  }

  async updateInterviewStatus(id: string, updateInterviewStatusDto: UpdateInterviewStatusDto): Promise<ApplicantDocument> {
    const { phase, status, interviewDate } = updateInterviewStatusDto;
    const applicant = await this.findOne(id);
    if (!applicant.notes) {
      applicant.notes = '';
    }

    if (status === 'accepted') {
      applicant.notes += `\n${phase} phase accepted`;
      if (interviewDate) {
        if (phase === 'first') {
          applicant.firstInterviewDate = interviewDate;
        } else if (phase === 'second') {
          applicant.secondInterviewDate = interviewDate;
        }
        applicant.notes += `, interview scheduled for ${DateTime.fromISO(interviewDate.toISOString()).toFormat('dd MMMM yyyy HH:mm')}`;
      }
      if (phase === 'first') {
        // Move to second interview
        await this.sendSecondInterviewEmail(applicant, interviewDate);
      } else if (phase === 'second') {
        // Move to employment list
        await this.addToEmploymentList(applicant);
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

  async scheduleInterview(id: string, scheduleInterviewDto: ScheduleInterviewDto): Promise<ApplicantDocument> {
    const { phase, interviewDate } = scheduleInterviewDto;
    const applicant = await this.findOne(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }

    if (phase === 'first') {
      applicant.firstInterviewDate = new Date(interviewDate);
    } else if (phase === 'second') {
      applicant.secondInterviewDate = new Date(interviewDate);
    } else {
      throw new ConflictException('Invalid phase provided for scheduling.');
    }

    await this.mailService.sendMail({
      to: 'rediballa1@gmail.com', // Change this to your email address
      subject: `Interview Scheduled - ${phase} phase`,
      template: './interview-scheduled', // Ensure this template exists
      context: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        interviewDate: DateTime.fromISO(interviewDate).toFormat('dd MMMM yyyy HH:mm'),
        phase,
      },
    });

    await applicant.save();
    return applicant;
  }

  async rescheduleInterview(id: string, rescheduleInterviewDto: RescheduleInterviewDto): Promise<ApplicantDocument> {
    const { phase, newInterviewDate } = rescheduleInterviewDto;
    const applicant = await this.findOne(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }

    if (phase === 'first') {
      applicant.firstInterviewDate = new Date(newInterviewDate);
    } else if (phase === 'second') {
      applicant.secondInterviewDate = new Date(newInterviewDate);
    } else {
      throw new ConflictException('Invalid phase provided for rescheduling.');
    }

    await this.mailService.sendMail({
      to: 'rediballa1@gmail.com', // Change this to your email address
      subject: `Interview Rescheduled - ${phase} phase`,
      template: './interview-rescheduled', // Ensure this template exists
      context: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        newInterviewDate: DateTime.fromISO(newInterviewDate).toFormat('dd MMMM yyyy HH:mm'),
        phase,
      },
    });

    await applicant.save();
    return applicant;
  }

  private async sendSecondInterviewEmail(applicant: ApplicantDocument, interviewDate?: Date): Promise<void> {
    await this.mailService.sendMail({
      to: 'rediballa1@gmail.com', // Change this to your email address
      subject: 'Second Interview Scheduled',
      template: './second-interview', // Assuming you have a template in src/templates/second-interview.hbs
      context: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        interviewDate: interviewDate ? DateTime.fromISO(interviewDate.toISOString()).toFormat('dd MMMM yyyy HH:mm') : null,
      },
    });
  }

  private async sendRejectEmail(applicant: ApplicantDocument): Promise<void> {
    await this.mailService.sendMail({
      to: 'rediballa1@gmail.com', // Change this to your email address
      subject: 'Application Rejected',
      template: './reject', // Assuming you have a template in src/templates/reject.hbs
      context: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
      },
    });
  }

  private async addToEmploymentList(applicant: ApplicantDocument): Promise<void> {
    applicant.status = ApplicantStatus.EMPLOYED;
    await this.mailService.sendMail({
      to: 'rediballa1@gmail.com', // Change this to your email address
      subject: 'Employment Confirmation',
      template: './employment', // Assuming you have a template in src/templates/employment.hbs
      context: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
      },
    });
    await applicant.save();
  }

  async updateEmploymentStatus(id: string, updateEmploymentStatusDto: UpdateEmploymentStatusDto): Promise<ApplicantDocument> {
    const applicant = await this.findOne(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }

    applicant.status = updateEmploymentStatusDto.employed ? ApplicantStatus.EMPLOYED : ApplicantStatus.REJECTED;
    await applicant.save();

    await this.mailService.sendMail({
      to: 'rediballa1@gmail.com', // Change this to your email address
      subject: updateEmploymentStatusDto.employed ? 'Employment Confirmation' : 'Employment Rejection',
      template: updateEmploymentStatusDto.employed ? './employment' : './reject', // Assuming you have these templates
      context: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
      },
    });

    return applicant;
  }
  async sendCustomEmail(id: string, sendCustomEmailDto: SendCustomEmailDto): Promise<void> {
    const applicant = await this.findOne(id);
    if (!applicant) {
      throw new NotFoundException(`Applicant with id ${id} not found`);
    }

    const { subject, message } = sendCustomEmailDto;

    await this.mailService.sendMail({
      to: applicant.email,
      subject,
      html: `<p>${message}</p>`, // Use `html` to send a plain HTML message
    });
  }
}

