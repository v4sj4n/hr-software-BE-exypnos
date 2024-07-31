import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApplicantDocument = Applicant & Document;

@Schema()
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

  @Prop({ required: true })
  individualProjects: string;

  @Prop()
  interviewDate?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  salaryExpectations: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  cvAttachment?: string;
}

export const ApplicantSchema = SchemaFactory.createForClass(Applicant);
