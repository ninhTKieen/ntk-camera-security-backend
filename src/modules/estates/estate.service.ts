import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { paginate } from 'nestjs-typeorm-paginate';
import { EEstateMemberStatus, EEstateRole } from 'src/common/common.enum';
import { Area } from 'src/entities/area.entity';
import { EstateMember } from 'src/entities/estate-member.entity';
import { Estate } from 'src/entities/estate.entity';
import { RecognizedFace } from 'src/entities/recognized-face.entity';
import { User } from 'src/entities/user.entity';
import { CreateRecognizedFaceDto } from 'src/recognized-faces/dto/create-recognized-face.dto';
import { UpdateRecognizedFaceDto } from 'src/recognized-faces/dto/update-recognized-face.dto';
import { Repository } from 'typeorm';

import { ImageService } from '../image/image.service';
import { UsersService } from '../users/users.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateEstateDto } from './dto/create-estate.dto';
import { GetAllEstateDto, GetAllEstateParams } from './dto/get-all-estate.dto';
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

    @InjectRepository(RecognizedFace)
    private readonly recognizedFaceRepository: Repository<RecognizedFace>,

    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,

    private readonly userService: UsersService,
    private readonly imageService: ImageService,
  ) {}

  async findAll(userId: number, options: GetAllEstateParams) {
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
      .leftJoin('estate.members', 'member', 'member.userId = :userId', {
        userId,
      })
      .addSelect(['member.role', 'member.status'])
      .where('member.userId = :userId', { userId })
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
    const savedEstate = await this.estateRepository.save(estate);

    const estateMember = this.estateMemberRepository.create({
      user,
      estate: savedEstate,
      role: EEstateRole.OWNER,
      nickname: user.name,
      status: EEstateMemberStatus.JOINED,
    });

    await this.estateMemberRepository.save(estateMember);

    const currentFolder = `${process.cwd()}/uploads/estates`;
    const uploadsFolder = `${currentFolder}/${savedEstate.id}/known_people`;

    if (!fs.existsSync(uploadsFolder)) {
      fs.mkdirSync(uploadsFolder, { recursive: true });
    }

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

  async inviteMember(
    estateId: number,
    addMember: AddMemberDto,
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

    const isInvited = estate.members.some(
      (estateMember) =>
        estateMember.user.username === addMember.username &&
        estateMember.status === EEstateMemberStatus.PENDING,
    );
    if (isInvited) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'User is already invited to this estate',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isJoined = estate.members.some(
      (estateMember) =>
        estateMember.user.username === addMember.username &&
        estateMember.status === EEstateMemberStatus.JOINED,
    );

    if (isJoined) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'User is already a member of this estate',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const estateMember = this.estateMemberRepository.create({
      user: member,
      estate,
      role: addMember.role,
      nickname: addMember.nickname,
      status: EEstateMemberStatus.PENDING,
    });

    await this.estateMemberRepository.save(estateMember);
  }

  async acceptInvitation(estateId: number, userId: number) {
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

    const member = estate.members.find((member) => member.user.id === userId);

    if (!member) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Member not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (member.status !== EEstateMemberStatus.PENDING) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'User is already a member of this estate',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    member.status = EEstateMemberStatus.JOINED;

    await this.estateMemberRepository.save(member);
  }

  async rejectInvitation(estateId: number, userId: number) {
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

    const member = estate.members.find((member) => member.user.id === userId);

    if (!member) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Member not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.estateMemberRepository.delete(member.id);

    return { message: 'Invitation rejected successfully' };
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

  async uploadKnownFace(
    file: Express.Multer.File,
    estateId: number,
    idCode: string,
    userInfo: User,
  ) {
    const user = await this.userService.findOne(userInfo, userInfo.id);

    const estate = await this.findById(estateId, user.id);

    const isMember = estate.members.some(
      (member) => member.user.id === user.id,
    );

    if (!isMember) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to upload known face',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const isOwnerOrAdmin = estate.members.some(
      (member) =>
        member.user.id === user.id &&
        (member.role === EEstateRole.OWNER ||
          member.role === EEstateRole.ADMIN),
    );

    if (!isOwnerOrAdmin) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to upload known face',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const currentFolder = `${process.cwd()}/uploads/estates`;
      const uploadsFolder = `${currentFolder}/${estateId}/known_people`;

      const fileExtension = file.originalname.split('.')[1];
      file.originalname = `${idCode}.${fileExtension}`;

      const response = this.imageService.saveFileToLocal(file, uploadsFolder);
      return response;
    } catch (err) {
      console.log('err', err);
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to upload known face',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private checkAvailableIdCode(idCode: string, estateId: number) {
    return this.recognizedFaceRepository.findOne({
      where: { idCode, estate: { id: estateId } },
    });
  }

  async addRecognizedFace(
    createRecognizedFaceDto: CreateRecognizedFaceDto,
    estateId: number,
    user: User,
  ) {
    const estate = await this.findById(estateId, user.id);

    if (!estate) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Estate not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isAvailableIdCode = await this.checkAvailableIdCode(
      createRecognizedFaceDto.idCode,
      estateId,
    );

    if (isAvailableIdCode) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'ID code already exists',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const recognizedFace = this.recognizedFaceRepository.create({
      ...createRecognizedFaceDto,
      estate,
    });

    await this.recognizedFaceRepository.save(recognizedFace);
  }

  async getRecognizedFaces(estateId: number, userId: number) {
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

    const recognizedFaces = await this.recognizedFaceRepository.find({
      where: {
        estate: { id: estate.id },
      },
    });

    return recognizedFaces;
  }

  async getRecognizedFace(estateId: number, recognizedFaceId: number, userId) {
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

    const recognizedFace = await this.recognizedFaceRepository.findOne({
      where: {
        id: recognizedFaceId,
        estate: { id: estate.id },
      },
    });

    if (!recognizedFace) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Recognized face not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return recognizedFace;
  }

  async updateRecognizedFace(
    estateId: number,
    recognizedFaceId: number,
    createRecognizedFaceDto: UpdateRecognizedFaceDto,
    userId: number,
  ) {
    const recognizedFace = await this.recognizedFaceRepository.findOne({
      where: { id: recognizedFaceId },
    });

    if (!recognizedFace) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Recognized face not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const estate = await this.findById(estateId, userId);

    const isOwner = estate.members.some(
      (member) =>
        member.user.id === userId && member.role === EEstateRole.OWNER,
    );

    if (!isOwner) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to update recognized faces',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.recognizedFaceRepository.update(
      recognizedFaceId,
      createRecognizedFaceDto,
    );
  }

  async deleteRecognizedFace(
    estateId: number,
    recognizedFaceId: number,
    userId: number,
  ) {
    const recognizedFace = await this.recognizedFaceRepository.findOne({
      where: { id: recognizedFaceId },
    });

    if (!recognizedFace) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Recognized face not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const estate = await this.findById(estateId, userId);

    const isOwner = estate.members.some(
      (member) =>
        member.user.id === userId && member.role === EEstateRole.OWNER,
    );

    if (!isOwner) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to delete recognized faces',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.recognizedFaceRepository.delete(recognizedFaceId);
  }

  async findRecognizedFaceByCode(idCode: string, estateId: number) {
    return this.recognizedFaceRepository.findOne({
      where: { idCode, estate: { id: estateId } },
    });
  }
}
