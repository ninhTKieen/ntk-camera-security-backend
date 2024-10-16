import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from 'src/entities/device.entity';
import { EstateService } from 'src/modules/estates/estate.service';
import { Repository } from 'typeorm';

import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,

    private readonly estateService: EstateService,
  ) {}

  async create(createDeviceDto: CreateDeviceDto, userId: number) {
    const estate = await this.estateService.findById(
      createDeviceDto.estateId,
      userId,
    );

    if (createDeviceDto.areaId) {
      const isHaveArea = estate.areas.some(
        (area) => area.id === createDeviceDto.areaId,
      );

      if (!isHaveArea) {
        throw new HttpException(
          {
            code: HttpStatus.NOT_FOUND,
            message: 'This area is not belong to this estate',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const device = this.deviceRepository.save({
      ...createDeviceDto,
      estate,
    });

    return device;
  }

  async findAll(estateId: number, userId: number) {
    console.log('estateId', estateId);
    await this.estateService.findById(estateId, userId);

    const devices = await this.deviceRepository.find({
      where: {
        estate: {
          id: estateId,
        },
      },
      relations: ['area'],
    });

    return devices;
  }

  findOne(id: number) {
    return `This action returns a #${id} device`;
  }

  update(id: number, updateDeviceDto: UpdateDeviceDto) {
    return `This action updates a #${id} device`;
  }

  remove(id: number) {
    return `This action removes a #${id} device`;
  }
}
