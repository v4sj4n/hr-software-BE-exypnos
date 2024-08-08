import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApplicantStatus } from '../enum/applicantStatus.enum';

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

  @Prop({ required: true })
  age: string;

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

  @Prop({ required: false })
  notes: string;

  @Prop({ required: true })
  salaryExpectations: string;

  @Prop()
  cvAttachment?: string;

  @Prop({ required: false, enum: ApplicantStatus, default: 'pending' })
  status: string;

  @Prop({ required: false })
  interviewNotes?: string;

  @Prop({ required: false })
  rejectionNotes?: string;

  @Prop({ type: Date, default: null })
  interviewDate: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ required: false })
  currentPhase?: string;
}

export const ApplicantSchema = SchemaFactory.createForClass(Applicant);
ApplicantSchema.plugin(require('mongoose-unique-validator'));
