import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';
import { validateConfig } from 'src/utils/common.util';

export type TFirebaseConfig = {
  projectId: string;
  privateKey: string;
  clientEmail: string;
};

class FirebaseConfigValidator {
  @IsString()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  FIREBASE_PRIVATE_KEY: string;

  @IsString()
  FIREBASE_CLIENT_EMAIL: string;
}

export default registerAs('firebase', () => {
  validateConfig(process.env, FirebaseConfigValidator);

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
});
