import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ERole } from 'src/common/common.enum';
import { IAppConfig } from 'src/configs/app.config';
import { IAuthConfig } from 'src/configs/auth.config';
import { ErrorMessages } from 'src/configs/constant.config';

import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { IJwtPayload } from './dto/jwt-payload.interface';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<IAppConfig & IAuthConfig>,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findWithEmail(loginDto.email, true);

    if (!user || !bcrypt.compareSync(loginDto.password, user.password)) {
      throw new HttpException(
        {
          code: HttpStatus.UNAUTHORIZED,
          message: ErrorMessages.INVALID_CREDENTIALS,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    delete user.password;

    return {
      accessToken: await this.generateToken(user, loginDto.isRemember),
      refreshToken: await this.generateToken(user, true),
      user,
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    if (!!(await this.usersService.findWithEmail(registerDto.email))) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: ErrorMessages.EMAIL_ALREADY_EXISTS,
        },
        HttpStatus.CONFLICT,
      );
    }

    registerDto.password = bcrypt.hashSync(
      registerDto.password,
      this.configService.get('bcryptSalt'),
    );
    registerDto.role = ERole.USER;

    const newUser = await this.usersService.create(registerDto);

    delete newUser.password;

    return {
      accessToken: await this.generateToken(newUser),
      refreshToken: await this.generateToken(newUser, true),
      user: newUser,
    };
  }

  async forgotPassword({ email, newPassword }: ForgotPasswordDto) {
    const user = await this.usersService.findWithEmail(email);

    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: ErrorMessages.USER_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    user.password = bcrypt.hashSync(
      newPassword,
      this.configService.get('bcryptSalt'),
    );
    // by default should be user
    user.role = ERole.USER;

    await this.usersService.create(user);

    delete user.password;

    return {
      accessToken: await this.generateToken(user),
      refreshToken: await this.generateToken(user, true),
      user,
    };
  }

  async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    const payload =
      await this.jwtService.verifyAsync<IJwtPayload>(refreshToken);

    if (!payload) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ErrorMessages.INVALID_TOKEN,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      accessToken: await this.generateToken(payload.user),
      refreshToken: await this.generateToken(payload.user, true),
      user: payload.user,
    };
  }

  private generateToken(user: any, isLongExpires = false) {
    const plainObject = JSON.parse(JSON.stringify(user));
    return this.jwtService.signAsync(
      {
        user: plainObject,
      },
      {
        expiresIn: isLongExpires
          ? this.configService.get('jwtLongExpiresIn')
          : this.configService.get('jwtShortExpiresIn'),
      },
    );
  }
}
