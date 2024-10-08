import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { EstateMember, EstateRole } from 'src/entities/estate-member.entity';
import { Estate } from 'src/entities/estate.entity';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
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
      role: EstateRole.OWNER,
    });

    await this.estateMemberRepository.save(estateMember);

    return savedEstate;
  }
}
