import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { ERole } from 'src/common/common.enum';
import { Relay } from 'src/entities/relay.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

import { EstateService } from '../estates/estate.service';
import { AdminGetListRelayDto } from './dto/admin-get-list-relay.dto';
import { CreateRelayDto } from './dto/create-relay.dto';
import { GetListRelayDto } from './dto/get-list-relay.dto';
import { UpdateRelayDto } from './dto/update-relay.dto';

@Injectable()
export class RelayService {
  constructor(
    @InjectRepository(Relay)
    private readonly relayRepository: Repository<Relay>,
    private readonly estateService: EstateService,
  ) {}

  async create(createRelayDto: CreateRelayDto, userId: number) {
    const estate = await this.estateService.findById(
      createRelayDto.estateId,
      userId,
    );

    const relay = this.relayRepository.create({
      ...createRelayDto,
      estate,
    });

    await this.relayRepository.save(relay);

    return {
      code: HttpStatus.CREATED,
      message: 'Create relay successfully',
      data: relay,
    };
  }

  async findAll(input: GetListRelayDto, userId: number) {
    await this.estateService.findById(input.estateId, userId);

    const qb = this.relayRepository
      .createQueryBuilder('relay')
      .leftJoin('relay.estate', 'estate')
      .addSelect(['estate.id', 'estate.name'])
      .where('relay.estateId = :estateId', { estateId: input.estateId })
      .orderBy(input.sort, input.order);

    if (input.search) {
      qb.andWhere(
        '(relay.name ILIKE :search OR relay.description ILIKE :search)',
        {
          search: `%${input.search}%`,
        },
      );
    }

    const paginatedResults = await paginate<Relay>(qb, input);

    const modifiedResults = paginatedResults.items.map((relay) => ({
      ...relay,
      estateName: relay.estate?.name || null,
    }));

    return {
      ...paginatedResults,
      items: modifiedResults,
    };
  }

  async adminFindAll(input: AdminGetListRelayDto) {
    const qb = this.relayRepository
      .createQueryBuilder('relay')
      .leftJoin('relay.estate', 'estate')
      .addSelect(['estate.id', 'estate.name'])
      .orderBy(input.sort, input.order);

    if (input.search) {
      qb.andWhere(
        '(relay.name ILIKE :search OR relay.description ILIKE :search)',
        {
          search: `%${input.search}%`,
        },
      );
    }

    if (input.estateId) {
      qb.andWhere('relay.estateId = :estateId', { estateId: input.estateId });
    }

    const paginatedResults = await paginate<Relay>(qb, input);

    const modifiedResults = paginatedResults.items.map((relay) => ({
      ...relay,
      estateName: relay.estate?.name || null,
    }));

    return {
      ...paginatedResults,
      items: modifiedResults,
    };
  }

  async findOne(id: number, userId: number) {
    const relay = await this.relayRepository.findOne({
      where: { id },
      relations: ['estate'],
    });

    if (!relay) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Relay not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.estateService.findById(relay.estate.id, userId);

    return {
      code: HttpStatus.OK,
      message: 'Get relay successfully',
      data: relay,
    };
  }

  async update(id: number, updateRelayDto: UpdateRelayDto, userId: number) {
    const relay = await this.findOne(id, userId);

    if (!relay) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Relay not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.relayRepository.update(id, {
      ...updateRelayDto,
    });

    return {
      code: HttpStatus.OK,
      message: 'Update relay successfully',
    };
  }

  async remove(userInfo: User, id: number) {
    if (userInfo.role !== ERole.ADMIN) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to access this resource',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const relay = await this.relayRepository.findOne({
      where: { id },
    });

    if (!relay) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Relay not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.relayRepository.remove(relay);

    return {
      code: HttpStatus.OK,
      message: 'Delete relay successfully',
    };
  }

  async removeMultiple(userInfo: User, ids: number[]) {
    if (userInfo.role !== ERole.ADMIN) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to access this resource',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const result = await this.relayRepository.softDelete(ids);

    return !!result;
  }
}
