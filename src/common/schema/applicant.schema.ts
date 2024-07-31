import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import muv from 'mongoose-unique-validator';

@Schema({
  timestamps: true,
})
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

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  positionApplied: string;

  @Prop({ required: true })
  technologiesUsed: string;

  @Prop({ required: false })
  individualProjects: string;

  @Prop({ required: false })
  interviewDate?: Date;

  @Prop({ required: false })
  notes: string;

  @Prop({ required: true })
  salaryExpectations: string;

  @Prop()
  cvAttachment?: string;

  @Prop({ required: false })
  status: string;

  @Prop({ required: false })
  interviewNotes?: string;

  @Prop({ required: false })
  rejectionNotes?: string;
}

const ApplicantSchema = SchemaFactory.createForClass(Applicant);
ApplicantSchema.plugin(muv);
export { ApplicantSchema };
