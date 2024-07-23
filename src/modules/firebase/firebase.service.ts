import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { Notification } from 'firebase-admin/lib/messaging/messaging-api';
import { ERole } from 'src/common/common.enum';
import { ErrorMessages } from 'src/configs/constant.config';
import { FcmToken } from 'src/entities/fcm-token.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

import { SendNotificationDto } from './dto/admin-firebase.dto';
import { CreateFcmTokenDto } from './dto/create-fcm-token.dto';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
  ) {}

  private isValidUrl(url: string) {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i', // fragment locator
    );
    return !!urlPattern.test(url);
  }

  async createToken(userInfo: User, createFcmToken: CreateFcmTokenDto) {
    const userId = userInfo.id;

    const existingToken = await this.fcmTokenRepository
      .createQueryBuilder('fcmToken')
      .where('fcmToken.user_id = :userId', { userId })
      .andWhere('fcmToken.deviceId = :deviceId', {
        deviceId: createFcmToken.deviceId,
      })
      .getOne();

    if (existingToken) {
      existingToken.token = createFcmToken.token;
      existingToken.language = createFcmToken.language;

      return this.fcmTokenRepository.save(existingToken);
    } else {
      return this.fcmTokenRepository.save({
        ...createFcmToken,
        user: userInfo,
      });
    }
  }

  async deleteToken(user: User, userId: number, deviceId: string) {
    const isAdmin = user.role === ERole.ADMIN;
    const isOwnToken = user.id === userId;

    if (isAdmin || isOwnToken) {
      const existingToken = await this.fcmTokenRepository
        .createQueryBuilder('fcmToken')
        .where('fcmToken.user_id = :userId', { userId })
        .andWhere('fcmToken.deviceId = :deviceId', { deviceId })
        .getOne();

      if (existingToken) {
        return this.fcmTokenRepository.remove(existingToken);
      } else {
        throw new HttpException(
          {
            code: HttpStatus.NOT_FOUND,
            message: ErrorMessages.TOKEN_NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } else {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: ErrorMessages.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private async send(sendNotificationDto: SendNotificationDto) {
    try {
      const response = await admin
        .messaging()
        .sendEachForMulticast(sendNotificationDto);
      this.logger.log(
        `Notification sent successfully: ${response.successCount} ${response.failureCount}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending notification: ${error.message}`,
        error.stack,
      );
    }
  }

  async sendToUser(
    userId: number,
    notification: Notification,
    data?: { [key: string]: string },
  ) {
    const tokens = await this.fcmTokenRepository
      .createQueryBuilder('fcmToken')
      .where('fcmToken.user_id = :userId', { userId })
      .getMany();

    if (tokens.length === 0) {
      this.logger.warn(`No tokens found for user ID ${userId}`);
      return;
    }

    const tokensString = tokens.map((fcm) => fcm.token);

    if (notification.imageUrl && !this.isValidUrl(notification.imageUrl)) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.INVALID_URL,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    this.send({
      tokens: tokensString,
      notification,
      data,
    });
  }
}
