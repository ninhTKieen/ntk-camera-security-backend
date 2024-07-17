import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
      .where('fcmToken.token = :token', { token: createFcmToken.token })
      .andWhere('fcmToken.user = :userId', { userId })
      .getOne();

    if (existingToken) {
      return existingToken;
    } else {
      this.fcmTokenRepository.save({
        userId,
        ...createFcmToken,
      });
    }
  }
}
