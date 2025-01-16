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
  @ApiOperation({ summary: 'Create device' })
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
    return this.devicesService.findAll(input, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get device by id' })
  @Get(':id')
  @ApiOkResponseCommon(Device)
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userInfo = req.user;
    return this.devicesService.findOne(id, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update device by id' })
  @Patch(':id')
  @ApiOkResponseCommon(Boolean)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.devicesService.update(id, updateDeviceDto, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete device by id' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.devicesService.remove(id, req.user.id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all recognized faces' })
  @Get(':id/recognized-faces')
  getRecognizedFaces(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.devicesService.getRecognizedFaces(id, req.user.id);
  }
}
