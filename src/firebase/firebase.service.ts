import { ConflictException, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  async uploadFile(
    file: Express.Multer.File,
    directoryToSave: string,
  ): Promise<string> {
    try {
      const bucket = admin.storage().bucket('gs://exypnos-63ca1.appspot.com');
      const fileName = `${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(`${directoryToSave}/${fileName}`);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise<void>((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('Error in stream:', error);
          reject(new ConflictException('Failed to upload file'));
        });

        stream.on('finish', resolve);
        stream.end(file.buffer);
      });

      await fileUpload.makePublic();
      const publicUrl = fileUpload.publicUrl();
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new ConflictException('Failed to upload file');
    }
  }
}
