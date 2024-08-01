export interface MailContent {
  to: string;
  subject: string;
  template: string;
  context: { [key: string]: any };
}
