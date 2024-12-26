import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  ApiOkResponseCommon,
  ApiOkResponsePaginated,
} from 'src/common/common-swagger-response.dto';
import { GetPaginatedDto } from 'src/common/get-paginated.dto';

import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteManyUserDto } from './dto/delete-many-user.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { GetDetailUserDto } from './dto/get-detail-user.dto';
import { UsersService } from './users.service';

@Controller('api/admin/users')
@ApiSecurity('access-token')
@ApiTags('Admin Users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get all users' })
  @Get('/get-all')
  @ApiOkResponsePaginated(GetAllUserDto)
  findAll(@Request() req: any, @Query() options: GetPaginatedDto) {
    return this.usersService.findAll(req.user, options);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponseCommon(GetDetailUserDto)
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userInfo = req.user;
    return this.usersService.findOne(userInfo, id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiOkResponseCommon(Boolean)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiOkResponseCommon(Boolean)
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: AdminUpdateUserDto,
  ) {
    const userInfo = req.user;
    return this.usersService.adminUpdate(id, updateUserDto, userInfo);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiOkResponseCommon(Boolean)
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userInfo = req.user;
    return this.usersService.remove(userInfo, id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('/delete-multiple')
  @ApiOperation({ summary: 'Delete multiple users' })
  @ApiOkResponseCommon(Boolean)
  removeMultiple(@Request() req, @Body() body: DeleteManyUserDto) {
    const userInfo = req.user;
    return this.usersService.removeMultiple(userInfo, body.ids);
  }
}
