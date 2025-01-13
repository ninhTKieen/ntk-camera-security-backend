import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { paginate } from 'nestjs-typeorm-paginate';
import { EEstateMemberStatus, EEstateRole } from 'src/common/common.enum';
import { Device } from 'src/entities/device.entity';
import { EstateMember } from 'src/entities/estate-member.entity';
import { Estate } from 'src/entities/estate.entity';
import { RecognizedFace } from 'src/entities/recognized-face.entity';
import { Relay } from 'src/entities/relay.entity';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { AdminAddMemberDto } from './dto/add-member.dto';
import { AdminCreateEstateDto } from './dto/admin-create-estate.dto';
import { AdminUpdateEstateDto } from './dto/admin-update-estate-dto';
import { GetAllEstateDto, GetAllEstateParams } from './dto/get-all-estate.dto';

@Injectable()
export class AdminEstateService {
  constructor(
    @InjectRepository(Estate)
    private readonly estateRepository: Repository<Estate>,

    @InjectRepository(EstateMember)
    private readonly estateMemberRepository: Repository<EstateMember>,

    @InjectRepository(RecognizedFace)
    private readonly recognizedFaceRepository: Repository<RecognizedFace>,

    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,

    @InjectRepository(Relay)
    private readonly relayRepository: Repository<Relay>,

    private readonly userService: UsersService,
  ) {}

  async getAll(userId: number, options: GetAllEstateParams) {
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

    const qb = this.estateRepository
      .createQueryBuilder('estate')
      .leftJoin('estate.members', 'member')
      .addSelect(['member.role', 'member.status'])
      .orderBy(options.sort, options.order);

    if (options.search) {
      qb.andWhere('estate.name ILIKE :search', {
        search: `%${options.search}%`,
      });
    }

    if (options.status) {
      qb.andWhere('member.status = :status', { status: options.status });
    }

    const paginatedResults = await paginate<GetAllEstateDto>(qb, options);

    const modifiedResults = paginatedResults.items.map((estate) => {
      const userRole = estate.members?.[0]?.role || null;
      const userStatus = estate.members?.[0]?.status || null;
      delete estate.members;
      return { ...estate, role: userRole, status: userStatus };
    });

    return {
      ...paginatedResults,
      items: modifiedResults,
    };
  }

  async getOne(estateId: number) {
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
        'user.username',
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

    const modifiedMembers = estate.members.map((member) => ({
      ...member,
      username: member.user?.username,
      user: {
        ...member.user,
        username: undefined,
      },
    }));

    return {
      ...estate,
      members: modifiedMembers,
    };
  }

  async create(createEstateDto: AdminCreateEstateDto) {
    const { members, ...estateData } = createEstateDto;

    const isHaveOwner = members.find(
      (member) => member.role === EEstateRole.OWNER,
    );

    if (!isHaveOwner) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Owner is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const owner = await this.userService.findWithUsername(isHaveOwner.username);

    const estate = this.estateRepository.create(estateData);
    const savedEstate = await this.estateRepository.save(estate);

    const ownerMember = this.estateMemberRepository.create({
      user: owner,
      estate: savedEstate,
      role: EEstateRole.OWNER,
      nickname: isHaveOwner.nickname || owner.username,
      status: EEstateMemberStatus.JOINED,
    });
    await this.estateMemberRepository.save(ownerMember);

    const otherMembers = members.filter(
      (member) => member.role !== EEstateRole.OWNER,
    );

    if (otherMembers && otherMembers.length > 0) {
      const estateMembers = await Promise.all(
        otherMembers.map(async (member) => {
          const _member = await this.userService.findWithUsername(
            member.username,
          );
          if (!_member) {
            throw new HttpException(
              {
                code: HttpStatus.NOT_FOUND,
                message: `${member.username} not found`,
              },
              HttpStatus.NOT_FOUND,
            );
          }
          return this.estateMemberRepository.create({
            user: _member,
            estate: savedEstate,
            role: member.role || EEstateRole.NORMAL_USER,
            nickname: member.nickname || '',
            status: member.status || EEstateMemberStatus.PENDING,
          });
        }),
      );
      await this.estateMemberRepository.save(estateMembers);
    }

    const currentFolder = `${process.cwd()}/uploads/estates`;
    const uploadsFolder = `${currentFolder}/${savedEstate.id}/known_people`;

    if (!fs.existsSync(uploadsFolder)) {
      fs.mkdirSync(uploadsFolder, { recursive: true });
    }

    return savedEstate;
  }

  async update(id: number, updateEstateDto: AdminUpdateEstateDto) {
    const { members, ...estateData } = updateEstateDto;

    const estate = await this.estateRepository.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });

    if (!estate) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Estate not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(estate, estateData);
    await this.estateRepository.save(estate);

    if (members && members.length > 0) {
      const currentMembers = estate.members || [];

      for (const member of members) {
        const existingMember = currentMembers.find(
          (m) => m.user.username === member.username,
        );

        if (existingMember) {
          existingMember.role = member.role || existingMember.role;
          existingMember.nickname = member.nickname || existingMember.nickname;
          existingMember.status = member.status || existingMember.status;
          await this.estateMemberRepository.save(existingMember);
        } else {
          const newUser = await this.userService.findWithUsername(
            member.username,
          );

          if (!newUser) {
            throw new HttpException(
              {
                code: HttpStatus.NOT_FOUND,
                message: `${member.username} not found`,
              },
              HttpStatus.NOT_FOUND,
            );
          }

          const newMember = this.estateMemberRepository.create({
            user: newUser,
            estate,
            role: member.role || EEstateRole.NORMAL_USER,
            nickname: member.nickname || '',
            status: member.status || EEstateMemberStatus.PENDING,
          });
          await this.estateMemberRepository.save(newMember);
        }
      }

      const updatedUsernames = members.map((m) => m.username);
      const membersToRemove = currentMembers.filter(
        (m) => !updatedUsernames.includes(m.user.username),
      );

      if (membersToRemove.length > 0) {
        await this.estateMemberRepository.remove(membersToRemove);
      }
    }

    return {
      message: 'Estate updated successfully',
      estate,
    };
  }

  async delete(estateId: number) {
    const estate = await this.estateRepository.findOne({
      where: { id: estateId },
      relations: ['members', 'recognizedFaces', 'devices', 'relays'],
    });

    if (!estate) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Estate not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (estate.members.length > 0) {
      this.estateMemberRepository.delete({
        estate: { id: estateId },
      });
    }

    if (estate.recognizedFaces.length > 0) {
      this.recognizedFaceRepository.delete({
        estate: { id: estateId },
      });
    }

    if (estate.devices.length > 0) {
      this.deviceRepository.delete({
        estate: { id: estateId },
      });
    }

    if (estate.relays.length > 0) {
      this.relayRepository.delete({
        estate: { id: estateId },
      });
    }

    await this.estateRepository.delete(estateId);

    return {
      message: 'Estate deleted successfully',
    };
  }

  async deleteMultiple(ids: number[]) {
    const result = await this.estateRepository.softDelete(ids);

    if (!result.affected) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Estate not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async addMember(estateId: number, newMember: AdminAddMemberDto) {
    const estate = await this.estateRepository.findOne({
      where: { id: estateId },
    });

    if (!estate) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Estate not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const user = await this.userService.findWithUsername(newMember.username);

    if (!user) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const member = this.estateMemberRepository.create({
      user,
      estate,
      role: newMember.role,
      nickname: newMember.nickname || '',
      status: newMember.status,
    });

    await this.estateMemberRepository.save(member);

    return {
      message: 'Member added successfully',
    };
  }
}
