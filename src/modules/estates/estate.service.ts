import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { GetPaginatedDto } from 'src/common/get-paginated.dto';
import { Area } from 'src/entities/area.entity';
import { EEstateRole, EstateMember } from 'src/entities/estate-member.entity';
import { Estate } from 'src/entities/estate.entity';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateEstateDto } from './dto/create-estate.dto';
import { GetAllEstateDto } from './dto/get-all-estate.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class EstateService {
  constructor(
    @InjectRepository(Estate)
    private readonly estateRepository: Repository<Estate>,

    @InjectRepository(EstateMember)
    private readonly estateMemberRepository: Repository<EstateMember>,

    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,

    private readonly userService: UsersService,
  ) {}

  async findAll(userId: number, options: GetPaginatedDto) {
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
      .select(columns)
      .orderBy(options.sort, options.order);

    if (options.search) {
      qb.andWhere('estate.name ILIKE :search', {
        search: `%${options.search}%`,
      });
    }

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
      .leftJoinAndSelect('estate.areas', 'area')
      .leftJoinAndSelect('estate.devices', 'device')
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

    return {
      ...estate,
      role: estate.members.find((member) => member.user.id === userId).role,
    };
  }

  async update(
    estateId: number,
    updateEstateDto: UpdateEstateDto,
    userId: number,
  ) {
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

    const isOwner = estate.members.some(
      (member) =>
        member.user.id === userId && member.role === EEstateRole.OWNER,
    );

    if (!isOwner) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You are not the owner of this estate',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.estateRepository.update(estateId, updateEstateDto);

    return { message: 'Estate updated successfully' };
  }

  async delete(estateId: number, userId: number) {
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

    const isOwner = estate.members.some(
      (member) =>
        member.user.id === userId && member.role === EEstateRole.OWNER,
    );

    if (!isOwner) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You are not the owner of this estate',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (estate.members.length > 1) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Cannot delete estate with members',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.estateRepository.delete(estateId);

    return { message: 'Estate deleted successfully' };
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

  async updateMember(
    estateId: number,
    memberId: number,
    updateMember: UpdateMemberDto,
    userId: number,
  ) {
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

    const memberToUpdate = estate.members.find(
      (member) => member.id === memberId,
    );

    if (!memberToUpdate) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Member not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isOwnerOrAdmin = estate.members.some(
      (member) =>
        member.user.id === userId &&
        (member.role === EEstateRole.OWNER ||
          member.role === EEstateRole.ADMIN),
    );

    if (!isOwnerOrAdmin) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message:
            'You do not have permission to update members in this estate',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.estateMemberRepository.update(memberId, updateMember);
  }

  async deleteMember(estateId: number, memberId: number, userId: number) {
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

    const memberToDelete = estate.members.find(
      (member) => member.id === memberId,
    );

    if (!memberToDelete) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Member not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Ensure that only an owner or admin can delete members
    const isOwnerOrAdmin = estate.members.some(
      (member) =>
        member.user.id === userId &&
        (member.role === EEstateRole.OWNER ||
          member.role === EEstateRole.ADMIN),
    );

    if (!isOwnerOrAdmin) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message:
            'You do not have permission to delete members from this estate',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (memberToDelete.role === EEstateRole.OWNER) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'The owner cannot be deleted',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.estateMemberRepository.delete(memberId);

    return { message: 'Member deleted successfully' };
  }

  async addArea(estateId: number, area: CreateAreaDto, userId: number) {
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

    const isOwnerOrAdmin = estate.members.some(
      (member) =>
        member.user.id === userId &&
        (member.role === EEstateRole.OWNER ||
          member.role === EEstateRole.ADMIN),
    );

    if (!isOwnerOrAdmin) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to add areas to this estate',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const newArea = this.areaRepository.create({
      ...area,
      estate,
    });

    await this.areaRepository.save(newArea);

    return { message: 'Area added successfully' };
  }

  async updateArea(
    estateId: number,
    areaId: number,
    updateArea: UpdateAreaDto,
    userId: number,
  ) {
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

    const areaToUpdate = estate.areas.find((area) => area.id === areaId);

    if (!areaToUpdate) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Area not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isOwnerOrAdmin = estate.members.some(
      (member) =>
        member.user.id === userId &&
        (member.role === EEstateRole.OWNER ||
          member.role === EEstateRole.ADMIN),
    );

    if (!isOwnerOrAdmin) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to update areas in this estate',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.areaRepository.update(areaId, updateArea);

    return { message: 'Area updated successfully' };
  }

  async deleteArea(estateId: number, areaId: number, userId: number) {
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

    const areaToDelete = estate.areas.find((area) => area.id === areaId);

    if (!areaToDelete) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Area not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isOwnerOrAdmin = estate.members.some(
      (member) =>
        member.user.id === userId &&
        (member.role === EEstateRole.OWNER ||
          member.role === EEstateRole.ADMIN),
    );

    if (!isOwnerOrAdmin) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to delete areas in this estate',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.areaRepository.delete(areaId);

    return { message: 'Area deleted successfully' };
  }
}
