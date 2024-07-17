import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseCommon } from 'src/common/common-swagger-response.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateFcmTokenDto } from './dto/create-fcm-token.dto';
import { FirebaseService } from './firebase.service';

@Controller('api/fcm')
@ApiSecurity('access-token')
@ApiTags('Firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Send token' })
  @Post('/send-token')
  @ApiOkResponseCommon(Boolean)
  create(@Request() req: any, @Body() createFcmToken: CreateFcmTokenDto) {
    return this.firebaseService.createToken(req.user, createFcmToken);
  }
}
