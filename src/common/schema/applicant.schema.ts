import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApplicantPhase, ApplicantStatus } from '../enum/applicant.enum';

export type ApplicantDocument = Applicant & Document;

@Schema({ timestamps: true }) // Ensure timestamps are enabled
export class Applicant {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  experience: string;

  @Prop({ required: true })
  applicationMethod: string;

  @Prop({ type: Date, required: true }) //bd
  dob: Date;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  positionApplied: string;

  @Prop({ required: true })
  technologiesUsed: string;

  // @Prop({ required: false })
  // individualProjects: string;

  @Prop({ type: Date, default: null })
  firstInterviewDate?: Date;

  @Prop({ type: Date, default: null })
  secondInterviewDate?: Date;

  @Prop({
    required: false,
    default: 'applicant first_interview second_interview',
  }) 
  notes: string;

  @Prop({ required: true })
  salaryExpectations: string;

  @Prop()
  cvAttachment?: string;

  @Prop({
    required: false,
    default: ApplicantStatus.PENDING,
    enum: ApplicantStatus,
  })
  status: string;

  // @Prop({ required: false })
  // interviewNotes?: string;

  // @Prop({ required: false })
  // rejectionNotes?: string;

  // @Prop({ type: Date, default: null })
  // interviewDate: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({
    required: false,
    default: ApplicantPhase.APPLICANT,
    enum: ApplicantPhase,
  })
  currentPhase?: string;
}

export const ApplicantSchema = SchemaFactory.createForClass(Applicant);
ApplicantSchema.plugin(require('mongoose-unique-validator'));
