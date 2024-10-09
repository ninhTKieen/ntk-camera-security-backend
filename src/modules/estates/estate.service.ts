import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { EEstateRole, EstateMember } from 'src/entities/estate-member.entity';
import { Estate } from 'src/entities/estate.entity';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateEstateDto } from './dto/create-estate.dto';
import { GetAllEstateDto } from './dto/get-all-estate.dto';

@Injectable()
export class EstateService {
  constructor(
    @InjectRepository(Estate)
    private readonly estateRepository: Repository<Estate>,

    @InjectRepository(EstateMember)
    private readonly estateMemberRepository: Repository<EstateMember>,

    private readonly userService: UsersService,
  ) {}

  async findAll(userId: number, options: IPaginationOptions) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const metadata = this.estateRepository.metadata;

    const columns = metadata.columns.map(
      (column) => `estate.${column.propertyName}`,
    );

    const qb = this.estateRepository
      .createQueryBuilder('estate')
      .leftJoin('estate.members', 'member')
      .where('member.userId = :userId', { userId })
      .select(columns);

    return paginate<GetAllEstateDto>(qb, options);
  }

  async createEstate(createEstateDto: CreateEstateDto, userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const estate = this.estateRepository.create(createEstateDto);
    const savedEstate = await this.estateRepository.save(estate); // This will generate the estate's id

    const estateMember = this.estateMemberRepository.create({
      user,
      estate: savedEstate,
      role: EEstateRole.OWNER,
      nickname: user.name,
    });

    await this.estateMemberRepository.save(estateMember);

    return savedEstate;
  }

  async findById(estateId: number, userId) {
    console.log('estateId', estateId);
    console.log('userId', userId);
    const estate = await this.estateRepository
      .createQueryBuilder('estate')
      .leftJoinAndSelect('estate.members', 'member')
      .leftJoin('member.user', 'user')
      .addSelect([
        'user.id',
        'user.name',
        'user.email',
        'user.imageUrl',
        'user.gender',
        'user.dateOfBirth',
      ])
      .where('estate.id = :estateId', { estateId })
      .getOne();

    if (!estate) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Estate not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isMember = estate.members.some((member) => member.user.id === userId);

    if (!isMember) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You are not a member of this estate',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return estate;
  }

  async addMember(estateId: number, addMember: AddMemberDto, userId: number) {
    const estate = await this.findById(estateId, userId);

    if (!estate) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Estate not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isMember = estate.members.some(
      (estateMember) => estateMember.user.username === addMember.username,
    );

    if (isMember) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'User is already a member of this estate',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const member = await this.userService.findWithUsername(addMember.username);

    if (!member) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const estateMember = this.estateMemberRepository.create({
      user: member,
      estate,
      role: addMember.role,
      nickname: addMember.nickname,
    });

    await this.estateMemberRepository.save(estateMember);
  }
}
