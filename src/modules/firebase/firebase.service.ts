import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { Notification } from 'firebase-admin/lib/messaging/messaging-api';
import { FcmToken } from 'src/entities/fcm-token.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

import { CreateFcmTokenDto } from './dto/create-fcm-token.dto';

@Injectable()
export class FirebaseService {
  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
  ) {}

  async createToken(userInfo: User, createFcmToken: CreateFcmTokenDto) {
    const userId = userInfo.id;

    const existingToken = await this.fcmTokenRepository
      .createQueryBuilder('fcmToken')
      .where('fcmToken.user_id = :userId', { userId })
      .andWhere('fcmToken.token = :token', { token: createFcmToken.token })
      .getOne();

    if (existingToken) {
      return existingToken;
    } else {
      return this.fcmTokenRepository.save({
        ...createFcmToken,
        user: userInfo,
      });
    }
  }

  async sendOne(
    token: string,
    notification: Notification,
    data?: {
      [key: string]: string;
    },
  ) {
    await admin.messaging().sendEachForMulticast({
      tokens: [token],
      notification,
      data,
    });
  }
}
