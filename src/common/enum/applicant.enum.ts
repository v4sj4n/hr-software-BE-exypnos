export enum ApplicantStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EMPLOYED = 'employed',
}

export enum ApplicantPhase {
  APPLICANT = 'applicant',
  FIRST_INTERVIEW = 'first_interview',
  SECOND_INTERVIEW = 'second_interview',
}

export enum EmailType {
  FIRST_INTERVIEW = 'first_interview',
  SECOND_INTERVIEW = 'second_interview',
  SUCCESSFUL_APPLICATION = 'successful_application',
  REJECTED_APPLICATION = 'rejected_application',
  CUSTOM = 'custom',
}
