import { UploadApiErrorResponse as UploadImageErrorResponse } from 'cloudinary';

interface UploadImageSuccessResponse {
  imagePublicId: string;
  imagePublicUrl: string;
  imageSecureUrl: string;
  width: number;
  height: number;
  format: string;
}

export type UploadImageResponse =
  | UploadImageErrorResponse
  | UploadImageSuccessResponse;
