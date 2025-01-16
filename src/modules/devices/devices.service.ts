import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { paginate } from 'nestjs-typeorm-paginate';
import { Device } from 'src/entities/device.entity';
import { EstateService } from 'src/modules/estates/estate.service';
import { Repository } from 'typeorm';

import { ImageService } from '../image/image.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import {
  AdminGetListDeviceDto,
  GetListDeviceDto,
} from './dto/get-list-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,

    private readonly estateService: EstateService,

    private readonly imageService: ImageService,
  ) {}

  async create(createDeviceDto: CreateDeviceDto, userId: number) {
    const estate = await this.estateService.findById(
      createDeviceDto.estateId,
      userId,
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

  async getRecognizedFaces(deviceId: number, userId: number) {
    const device = await this.findOne(deviceId, userId);

    if (!device) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Device not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const currentFolder = `${process.cwd()}/uploads/estates/${
      device.estate.id
    }/faces/${deviceId}`;

    if (!fs.existsSync(currentFolder)) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Faces folder not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const faces = fs.readdirSync(currentFolder);

    return faces.map(
      (face) =>
        `/uploads/estates/${device.estate.id}/faces/${deviceId}/${face}`,
    );
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

    if (device.imageUrlId) {
      await this.imageService.deleteFile(device.imageUrlId);
    }

    this.deviceRepository.delete(id);

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
