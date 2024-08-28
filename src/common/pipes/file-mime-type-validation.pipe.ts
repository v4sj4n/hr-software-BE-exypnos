import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileMimeTypeValidationPipe implements PipeTransform {
  private allowedImageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/apng',
    'image/gif',
    'image/avif',
  ];
  private allowedCvMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  transform(value: any): any {
    if (value.photo) {
      const files = value.photo || [];
      for (const file of files) {
        if (!this.allowedImageMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `Invalid image file type: ${file.mimetype}`,
          );
        }
      }
    }

    if (value.file) {
      const file = value.file;
      if (!this.allowedCvMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid CV file type: ${file.mimetype}`);
      }
    }

    return value;
  }
}
