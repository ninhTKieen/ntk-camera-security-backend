import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseCommon } from 'src/common/common-swagger-response.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { GetDetailUserDto } from './dto/get-detail-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('api/users')
@ApiSecurity('access-token')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get me' })
  @Get('/get-me')
  @ApiOkResponseCommon(GetDetailUserDto)
  getMe(@Request() req: any) {
    const userInfo = req.user;
    return this.usersService.findOne(userInfo, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiOkResponseCommon(Boolean)
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userInfo = req.user;
    return this.usersService.update(userInfo, id, updateUserDto);
  }
}
