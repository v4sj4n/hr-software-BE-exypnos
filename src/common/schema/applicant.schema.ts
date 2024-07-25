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
  age: number;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  positionApplied: string;

  @Prop({ required: true })
  technologiesUsed: string;

  //@Prop({ required: true })
  //individualProjects: string;

  @Prop({ required: true })
  interviewDate: Date;

  //@Prop({ required: true })
  //notes: string;

  @Prop({ required: true })
  salaryExpectations: string;

  @Prop()
  cvAttachment?: string; // Optional field for CV attachment

  @Prop({ required: true })
  status: string;

  @Prop()
  interviewNotes?: string; // Optional field for interview notes

  @Prop()
  rejectionNotes?: string; // Optional field for rejection notes
}

export const ApplicantSchema = SchemaFactory.createForClass(Applicant);
