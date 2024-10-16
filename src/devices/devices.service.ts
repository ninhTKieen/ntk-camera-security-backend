import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Device } from 'src/entities/device.entity';
import { EstateService } from 'src/modules/estates/estate.service';
import { Repository } from 'typeorm';

import { CreateDeviceDto } from './dto/create-device.dto';
import { GetListDeviceDto } from './dto/get-list-device.dto';
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

    const isHaveArea = estate.areas.some(
      (area) => area.id === createDeviceDto?.areaId,
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

    const area = estate.areas.find(
      (area) => area.id === createDeviceDto?.areaId,
    );

    const device = this.deviceRepository.save({
      ...createDeviceDto,
      estate,
      area,
    });

    return device;
  }

  async findAll(input: GetListDeviceDto, userId: number) {
    const { estateId, areaId } = input;
    console.log('estateId', estateId);
    await this.estateService.findById(estateId, userId);

    const qb = this.deviceRepository
      .createQueryBuilder('device')
      .where('device.estateId = :estateId', { estateId })
      .leftJoin('device.estate', 'estate')
      .addSelect(['estate.id', 'estate.name'])
      .leftJoin('device.area', 'area')
      .addSelect(['area.id', 'area.name']);

    if (input.search) {
      qb.andWhere('device.name LIKE :search', {
        search: `%${input.search}%`,
      });
    }

    if (areaId) {
      qb.where('device.areaId = :areaId', { areaId });
    }

    qb.orderBy(input.sort, input.order);

    return paginate<Device>(qb, input);
  }

  findOne(id: number) {
    return `This action returns a #${id} device`;
  }

  update(id: number, updateDeviceDto: UpdateDeviceDto) {
    console.log('updateDeviceDto', updateDeviceDto);
    return `This action updates a #${id} device`;
  }

  remove(id: number) {
    return `This action removes a #${id} device`;
  }
}
