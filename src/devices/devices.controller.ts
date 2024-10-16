import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseCommon } from 'src/common/common-swagger-response.dto';
import { Device } from 'src/entities/device.entity';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { GetListDeviceDto } from './dto/get-list-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('api/devices')
@ApiSecurity('access-token')
@ApiTags('Devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create area' })
  @Post('/create')
  @ApiOkResponseCommon(Boolean)
  create(@Body() createDeviceDto: CreateDeviceDto, @Request() req) {
    const userInfo = req.user;
    return this.devicesService.create(createDeviceDto, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all devices' })
  @Get('get-all')
  @ApiOkResponseCommon(Device)
  findAll(@Query() input: GetListDeviceDto, @Request() req) {
    const userInfo = req.user;
    return this.devicesService.findAll(input.estateId, userInfo.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(+id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }
}
