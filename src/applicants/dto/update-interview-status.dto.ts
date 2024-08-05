export class UpdateInterviewStatusDto {
  phase: string;
  status: string; // 'accepted', 'rejected'
  interviewDate?: Date;
}
