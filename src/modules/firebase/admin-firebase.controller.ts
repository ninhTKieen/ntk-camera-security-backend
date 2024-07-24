import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseCommon } from 'src/common/common-swagger-response.dto';

import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { SendOneNotificationDto } from './dto/admin-firebase.dto';
import { FirebaseService } from './firebase.service';

@Controller('api/admin-fcm')
@ApiSecurity('access-token')
@ApiTags('Admin Firebase')
export class AdminFirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin send to user' })
  @Post('/send-one/:userId')
  @ApiOkResponseCommon(Boolean)
  sendOne(
    @Param('userId') userId: number,
    @Body() sendNotification: SendOneNotificationDto,
  ) {
    return this.firebaseService.sendToUser(
      userId,
      sendNotification.notification,
      sendNotification.data,
    );
  }
}
