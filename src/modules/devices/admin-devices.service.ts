import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Device } from 'src/entities/device.entity';
import { EstateService } from 'src/modules/estates/estate.service';
import { Repository } from 'typeorm';

import { ImageService } from '../image/image.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { AdminGetListDeviceDto } from './dto/get-list-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class AdminDevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,

    private readonly estateService: EstateService,

    private readonly imageService: ImageService,
  ) {}

  async adminCreate(createDeviceDto: CreateDeviceDto) {
    const estate = await this.estateService.adminFindById(
      createDeviceDto.estateId,
    );

    let area = null;
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

      area = estate.areas.find((area) => area.id === createDeviceDto.areaId);
    }

    const device = this.deviceRepository.save({
      ...createDeviceDto,
      estate,
      area,
    });

    return {
      code: HttpStatus.OK,
      message: 'Create device success',
      data: device,
    };
  }

  async adminFindAll(input: AdminGetListDeviceDto) {
    const qb = this.deviceRepository
      .createQueryBuilder('device')
      .orderBy('device.id', 'DESC')
      .leftJoin('device.estate', 'estate')
      .addSelect(['estate.id', 'estate.name'])
      .leftJoin('device.area', 'area')
      .addSelect(['area.id', 'area.name'])
      .orderBy(input.sort, input.order);

    if (input.search) {
      qb.andWhere('device.name LIKE :search', {
        search: `%${input.search}%`,
      });
    }

    if (input.estateId) {
      qb.where('device.estateId = :estateId', { estateId: input.estateId });
    }

    if (input.areaId) {
      qb.where('device.areaId = :areaId', { areaId: input.areaId });
    }

    return paginate<Device>(qb, input);
  }

  async adminFindOne(id: number) {
    const device = await this.deviceRepository
      .createQueryBuilder('device')
      .leftJoin('device.estate', 'estate')
      .addSelect(['estate.id', 'estate.name'])
      .leftJoin('device.area', 'area')
      .addSelect(['area.id', 'area.name'])
      .where('device.id = :id', { id })
      .getOne();

    if (!device) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Device not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return device;
  }

  async adminUpdate(id: number, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.adminFindOne(id);

    if (
      updateDeviceDto.imageUrl &&
      updateDeviceDto.imageUrlId !== device.imageUrlId &&
      device.imageUrlId
    ) {
      await this.imageService.deleteFile(device.imageUrlId);
    }

    this.deviceRepository.update(id, updateDeviceDto);

    return true;
  }

  async adminRemove(id: number) {
    const device = await this.adminFindOne(id);

    if (device.imageUrlId) {
      await this.imageService.deleteFile(device.imageUrlId);
    }

    this.deviceRepository.delete(id);

    return true;
  }

  async adminRemoveMany(ids: number[]) {
    const devices = await this.deviceRepository.findByIds(ids);

    devices.forEach(async (device) => {
      if (device.imageUrlId) {
        await this.imageService.deleteFile(device.imageUrlId);
      }
    });

    this.deviceRepository.delete(ids);

    return true;
  }
}
