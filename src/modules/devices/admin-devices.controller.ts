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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseCommon } from 'src/common/common-swagger-response.dto';
import { Device } from 'src/entities/device.entity';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

import { AdminGuard } from '../auth/guards/admin.guard';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { AdminGetListDeviceDto } from './dto/get-list-device.dto';
import { AdminUpdateDeviceDto } from './dto/update-device.dto';

@Controller('api/admin/devices')
@ApiSecurity('access-token')
@ApiTags('Admin Devices')
export class AdminDevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create device' })
  @Post('/create')
  @ApiOkResponseCommon(Boolean)
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.adminCreate(createDeviceDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin get all devices' })
  @Get()
  @ApiOkResponseCommon(Device)
  findAll(@Query() input: AdminGetListDeviceDto) {
    return this.devicesService.adminFindAll(input);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Admin get device by id' })
  @Get(':id')
  @ApiOkResponseCommon(Device)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.devicesService.adminFindOne(id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Admin update device by id' })
  @Patch(':id')
  @ApiOkResponseCommon(Boolean)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: AdminUpdateDeviceDto,
  ) {
    return this.devicesService.adminUpdate(id, updateDeviceDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Admin delete device by id' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.devicesService.adminRemove(id);
  }
}
