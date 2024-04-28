import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
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
            id: result.public_id,
            url: result.secure_url,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        },
      );

      createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
