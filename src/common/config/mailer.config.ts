import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

export const MailerConfig = MailerModule.forRoot({
  transport: {
    host: 'smtp.example.com', // Replace with your SMTP host
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@example.com', // Replace with your email
      pass: 'your-email-password', // Replace with your email password
    },
  },
  defaults: {
    from: '"No Reply" <no-reply@example.com>',
  },
  template: {
    dir: path.join(__dirname, '../templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
