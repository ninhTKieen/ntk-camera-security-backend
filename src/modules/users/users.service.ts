import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { ERole } from 'src/common/common.enum';
import { ErrorMessages } from 'src/configs/constant.config';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

import { ImageService } from '../image/image.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly imageService: ImageService,
  ) {}

  async findAll(
    userInfo: User,
    options: IPaginationOptions,
  ): Promise<Pagination<GetAllUserDto>> {
    if (userInfo.role !== ERole.ADMIN) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to access this resource',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const qb = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.name',
        'user.username',
        'user.phoneNumber',
        'user.imageUrl',
        'user.imageUrlId',
        'user.gender',
        'user.dateOfBirth',
        'user.role',
        'user.createdAt',
      ])
      .orderBy('user.id', 'DESC');

    return paginate<GetAllUserDto>(qb, options);
  }

  async findOne(userInfo: User, id: number) {
    const user = this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .select('user');

    const result = await user.getOne();

    if (!result) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (userInfo.role !== ERole.ADMIN && userInfo.id !== result.id) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to access this resource',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return result;
  }

  async findById(id: number) {
    const user = this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .select('user');

    const result = await user.getOne();

    if (!result) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return result;
  }

  async findWithEmail(email: string, includePassword = false) {
    const qb = this.userRepository.createQueryBuilder('user').where({ email });

    if (includePassword) {
      qb.addSelect('user.password');
    }

    return qb.getOne();
  }

  async create(createUser: CreateUserDto) {
    return this.userRepository.save(createUser);
  }

  // Only for user, not for admin
  async update(userInfo: User, id: number, updateUser: UpdateUserDto) {
    const user = await this.findById(id);

    if (userInfo.role !== ERole.ADMIN && userInfo.id !== user.id) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: ErrorMessages.NOT_ALLOWED,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (updateUser.imageUrl && updateUser.imageUrlId !== user.imageUrlId) {
      await this.imageService.deleteFile(user.imageUrlId);
    }

    const result = await this.userRepository.update(id, updateUser);

    return !!result;
  }

  async remove(userInfo: User, id: number) {
    const user = await this.findById(id);
    const result = await this.userRepository.softDelete(user.id);

    if (userInfo.role !== ERole.ADMIN) {
      throw new HttpException(
        {
          code: HttpStatus.FORBIDDEN,
          message: 'You are not allowed to access this resource',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return !!result;
  }
}
