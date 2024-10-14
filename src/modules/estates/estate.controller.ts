import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { AddMemberDto } from './dto/add-member.dto';
import { CreateEstateDto } from './dto/create-estate.dto';
import { GetAllEstateDto } from './dto/get-all-estate.dto';
import { GetDetailEstateDto } from './dto/get-detail-estate.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
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

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update estate' })
  @Patch(':id')
  @ApiOkResponseCommon(Boolean)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstateDto: CreateEstateDto,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.update(id, updateEstateDto, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete estate' })
  @ApiOkResponseCommon(Boolean)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userInfo = req.user;
    return this.estateService.delete(id, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/add-member')
  @ApiOperation({ summary: 'Add member to estate' })
  @ApiOkResponseCommon(Boolean)
  async addMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() addMemberDto: AddMemberDto,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.addMember(id, addMemberDto, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/update-member/:memberId')
  @ApiOperation({ summary: 'Update member in estate' })
  @ApiOkResponseCommon(Boolean)
  async updateMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() updateMemberDto: UpdateMemberDto,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.updateMember(
      id,
      memberId,
      updateMemberDto,
      userInfo.id,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id/remove-member/:memberId')
  @ApiOperation({ summary: 'Remove member from estate' })
  @ApiOkResponseCommon(Boolean)
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.deleteMember(id, memberId, userInfo.id);
  }
}
