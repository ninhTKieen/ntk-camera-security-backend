import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  ApiOkResponseCommon,
  ApiOkResponsePaginated,
} from 'src/common/common-swagger-response.dto';
import { GetPaginatedDto } from 'src/common/get-paginated.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateEstateDto } from './dto/create-estate.dto';
import { GetAllEstateDto } from './dto/get-all-estate.dto';
import { GetDetailEstateDto } from './dto/get-detail-estate.dto';
import { EstateService } from './estate.service';

@Controller('api/estates')
@ApiSecurity('access-token')
@ApiTags('Estates')
export class EstateController {
  constructor(private readonly estateService: EstateService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all estates' })
  @Get('/get-all')
  @ApiOkResponsePaginated(GetAllEstateDto)
  findAll(@Request() req, @Query() options: GetPaginatedDto) {
    return this.estateService.findAll(req.user.id, options);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get estate' })
  @ApiOkResponseCommon(GetDetailEstateDto)
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.estateService.findById(id, req.user.id);
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create estate' })
  @Post('/create')
  @ApiOkResponseCommon(Boolean)
  async createEstate(@Body() createEstateDto: CreateEstateDto, @Request() req) {
    const userInfo = req.user;
    return this.estateService.createEstate(createEstateDto, userInfo.id);
  }
}
