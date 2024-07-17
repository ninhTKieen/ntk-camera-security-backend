import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseCommon } from 'src/common/common-swagger-response.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { SendNotificationDto } from './dto/admin-firebase.dto';
import { FirebaseService } from './firebase.service';

@Controller('api/admin-fcm')
@ApiSecurity('access-token')
@ApiTags('Admin Firebase')
export class AdminFirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Admin send one push notification' })
  @Post('/push-notification')
  @ApiOkResponseCommon(Boolean)
  create(@Body() sendNotification: SendNotificationDto) {
    return this.firebaseService.sendOne(
      sendNotification.token,
      sendNotification.notification,
      sendNotification.data,
    );
  }
}
