import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { TConfigs } from 'src/configs';
import { FIREBASE_PROVIDER_NAME } from 'src/configs/constant.config';
import { TFirebaseConfig } from 'src/configs/firebase.config';

export const FirebaseProvider = {
  provide: FIREBASE_PROVIDER_NAME,
  useFactory: async (configService: ConfigService<TConfigs>) => {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId:
          configService.getOrThrow<TFirebaseConfig>('firebase').projectId,
        privateKey: configService.get<TFirebaseConfig>('firebase').privateKey,
        clientEmail: configService.get<TFirebaseConfig>('firebase').clientEmail,
      }),
    });
  },
  inject: [ConfigService],
};
