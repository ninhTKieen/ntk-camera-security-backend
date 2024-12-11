import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import { UploadImageResponse } from 'src/common/upload-image-response';
import { createReadStream } from 'streamifier';

@Injectable()
export class ImageService {
  constructor() {}
  async uploadFile(file: Express.Multer.File): Promise<UploadImageResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'uploads',
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve({
            imagePublicId: result.public_id,
            imagePublicUrl: result.secure_url,
            imageSecureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        },
      );

      createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<{ result: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }

  async uploadKnownFace(file: Express.Multer.File, estateId: number) {
    // Get the filename without extension
    const filename = file.originalname.split('.')[0];

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `estates/${estateId}/known-faces`,
          public_id: filename, // Set the public_id to the original filename
          overwrite: true, // Optional: overwrite if file with same name exists
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve({
            imagePublicId: result.public_id,
            imagePublicUrl: result.secure_url,
            imageSecureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        },
      );

      createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async saveFileToLocal(
    file: Express.Multer.File,
    path: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const decodedFilename = file.originalname.normalize('NFC');

      const filePath = `${path}/${decodedFilename}`;

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) {
          console.log('err', err);
          reject(err);
          return false;
        }
        resolve(true);
      });
    });
  }
}
