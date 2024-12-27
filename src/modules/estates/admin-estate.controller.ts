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

import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { DeleteManyUserDto } from '../users/dto/delete-many-user.dto';
import { AdminEstateService } from './admin-estate.service';
import { AdminAddMemberDto } from './dto/add-member.dto';
import { AdminCreateEstateDto } from './dto/admin-create-estate.dto';
import { AdminUpdateEstateDto } from './dto/admin-update-estate-dto';
import { GetAllEstateDto, GetAllEstateParams } from './dto/get-all-estate.dto';

@Controller('api/admin/estates')
@ApiSecurity('access-token')
@ApiTags('Admin Estates')
export class AdminEstateController {
  constructor(private readonly adminEstateService: AdminEstateService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin get all estates' })
  @Get()
  @ApiOkResponsePaginated(GetAllEstateDto)
  findAll(@Request() req, @Query() options: GetAllEstateParams) {
    return this.adminEstateService.getAll(req.user.id, options);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin get estate by id' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminEstateService.getOne(id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin create estate' })
  @Post()
  create(@Body() body: AdminCreateEstateDto) {
    return this.adminEstateService.create(body);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin update estate' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AdminUpdateEstateDto,
  ) {
    return this.adminEstateService.update(id, body);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin delete estate' })
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.adminEstateService.delete(id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin delete multiple estates' })
  @Delete('/delete-multiple')
  @ApiOkResponseCommon(Boolean)
  removeMultiple(@Request() req, @Body() body: DeleteManyUserDto) {
    return this.adminEstateService.deleteMultiple(body.ids);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin add new estate member' })
  @Post(':id/members')
  addMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AdminAddMemberDto,
  ) {
    return this.adminEstateService.addMember(id, body);
  }
}
