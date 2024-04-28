import { UploadApiErrorResponse as UploadImageErrorResponse } from 'cloudinary';

interface UploadImageSuccessResponse {
  id: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

export type UploadImageResponse =
  | UploadImageErrorResponse
  | UploadImageSuccessResponse;
