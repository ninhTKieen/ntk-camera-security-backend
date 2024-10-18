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

    return {
      code: HttpStatus.OK,
      message: 'Create device success',
      data: device,
    };
  }

  async findAll(input: GetListDeviceDto, userId: number) {
    const { estateId, areaId } = input;
    await this.estateService.findById(estateId, userId);

    const qb = this.deviceRepository
      .createQueryBuilder('device')
      .where('device.estateId = :estateId', { estateId })
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

    if (areaId) {
      qb.where('device.areaId = :areaId', { areaId });
    }

    return paginate<Device>(qb, input);
  }

  async findOne(id: number, userId: number) {
    const device = await this.deviceRepository
      .createQueryBuilder('device')
      .leftJoin('device.estate', 'estate')
      .addSelect(['estate.id', 'estate.name'])
      .leftJoinAndSelect('estate.members', 'member')
      .leftJoin('member.user', 'user')
      .addSelect(['user.id', 'user.email'])
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

    const isMember = device.estate.members.some(
      (member) => member.user.id === userId,
    );

    if (!isMember) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to access this device',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return device;
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto, userId: number) {
    const device = await this.findOne(id, userId);

    const members = device.estate.members;

    const isOwnerOrAdmin = members.some(
      (member) =>
        member.user.id === userId &&
        (member.role === 'OWNER' || member.role === 'ADMIN'),
    );

    if (!isOwnerOrAdmin) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to update this device',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    this.deviceRepository.update(id, updateDeviceDto);

    return true;
  }

  async remove(id: number, userId: number) {
    const device = await this.findOne(id, userId);

    const members = device.estate.members;

    const isOwnerOrAdmin = members.some(
      (member) =>
        member.user.id === userId &&
        (member.role === 'OWNER' || member.role === 'ADMIN'),
    );

    if (!isOwnerOrAdmin) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to delete this device',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    this.deviceRepository.delete(id);

    return true;
  }
}
