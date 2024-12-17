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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiOkResponseCommon,
  ApiOkResponsePaginated,
} from 'src/common/common-swagger-response.dto';
import { CreateRecognizedFaceDto } from 'src/recognized-faces/dto/create-recognized-face.dto';
import { GetRecognizedFaceDto } from 'src/recognized-faces/dto/get-recognized-faces.dto';
import { UpdateRecognizedFaceDto } from 'src/recognized-faces/dto/update-recognized-face.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateEstateDto } from './dto/create-estate.dto';
import { GetAllEstateDto, GetAllEstateParams } from './dto/get-all-estate.dto';
import { GetDetailEstateDto } from './dto/get-detail-estate.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
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
  findAll(@Request() req, @Query() options: GetAllEstateParams) {
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
  @Post(':id/invite-member')
  @ApiOperation({ summary: 'Invite member to estate' })
  @ApiOkResponseCommon(Boolean)
  async inviteMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() addMemberDto: AddMemberDto,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.inviteMember(id, addMemberDto, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/accept-invitation')
  @ApiOperation({ summary: 'Accept invitation to estate' })
  @ApiOkResponseCommon(Boolean)
  async acceptInvitation(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.acceptInvitation(id, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @Post(':id/reject-invitation')
  @ApiOperation({ summary: 'Reject invitation to estate' })
  @ApiOkResponseCommon(Boolean)
  async rejectInvitation(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.rejectInvitation(id, userInfo.id);
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

  @UseGuards(AuthGuard)
  @Post(':id/add-area')
  @ApiOperation({ summary: 'Add area to estate' })
  @ApiOkResponseCommon(Boolean)
  async addArea(
    @Param('id', ParseIntPipe) id: number,
    @Body() area: CreateAreaDto,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.addArea(id, area, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/update-area/:areaId')
  @ApiOperation({ summary: 'Update area in estate' })
  @ApiOkResponseCommon(Boolean)
  async updateArea(
    @Param('id', ParseIntPipe) id: number,
    @Param('areaId', ParseIntPipe) areaId: number,
    @Body() area: UpdateAreaDto,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.updateArea(id, areaId, area, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/remove-area/:areaId')
  @ApiOperation({ summary: 'Remove area from estate' })
  @ApiOkResponseCommon(Boolean)
  async removeArea(
    @Param('id', ParseIntPipe) id: number,
    @Param('areaId', ParseIntPipe) areaId: number,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.deleteArea(id, areaId, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload known face' })
  @Post(':id/upload-known-face')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
        idCode: {
          type: 'string',
        },
      },
      required: ['image', 'idCode'],
    },
  })
  @ApiOkResponseCommon(Boolean)
  uploadKnownFace(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
    @Body('idCode') idCode: string,
    @Request() req,
  ) {
    return this.estateService.uploadKnownFace(file, id, idCode, req.user);
  }

  @UseGuards(AuthGuard)
  @Get(':id/recognized-faces')
  @ApiOperation({ summary: 'Get recognized faces of an estate' })
  @ApiParam({ name: 'id', type: Number, description: 'Estate ID' })
  @ApiOkResponseCommon(GetRecognizedFaceDto)
  getRecognizedFaces(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userInfo = req.user;
    return this.estateService.getRecognizedFaces(id, userInfo.id);
  }

  @UseGuards(AuthGuard)
  @Get(':id/recognized-faces/:recognizedFaceId')
  @ApiOperation({ summary: 'Get recognized face detail' })
  @ApiParam({ name: 'id', type: Number, description: 'Estate ID' })
  @ApiParam({
    name: 'recognizedFaceId',
    type: Number,
    description: 'Recognized Face ID',
  })
  @ApiOkResponseCommon(GetRecognizedFaceDto)
  getRecognizedFace(
    @Param('id', ParseIntPipe) id: number,
    @Param('recognizedFaceId', ParseIntPipe) recognizedFaceId: number,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.getRecognizedFace(
      id,
      recognizedFaceId,
      userInfo.id,
    );
  }

  @UseGuards(AuthGuard)
  @Post(':id/add-recognized-face')
  @ApiOperation({ summary: 'Add recognized face to estate' })
  @ApiOkResponseCommon(Boolean)
  addRecognizedFace(
    @Body() createRecognizedFaceDto: CreateRecognizedFaceDto,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.addRecognizedFace(
      createRecognizedFaceDto,
      id,
      userInfo,
    );
  }

  @UseGuards(AuthGuard)
  @Patch(':id/recognized-faces/:recognizedFaceId')
  @ApiOperation({ summary: 'Update recognized face details' })
  @ApiParam({ name: 'id', type: Number, description: 'Estate ID' })
  @ApiParam({
    name: 'recognizedFaceId',
    type: Number,
    description: 'Recognized Face ID',
  })
  @ApiOkResponseCommon(Boolean)
  updateRecognizedFace(
    @Param('id', ParseIntPipe) id: number,
    @Param('recognizedFaceId', ParseIntPipe) recognizedFaceId: number,
    @Body() updateRecognizedFaceDto: UpdateRecognizedFaceDto,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.updateRecognizedFace(
      recognizedFaceId,
      updateRecognizedFaceDto,
      userInfo.id,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id/recognized-faces/:recognizedFaceId')
  @ApiOperation({ summary: 'Delete recognized face' })
  @ApiOkResponseCommon(Boolean)
  deleteRecognizedFace(
    @Param('id', ParseIntPipe) id: number,
    @Param('recognizedFaceId', ParseIntPipe) recognizedFaceId: number,
    @Request() req,
  ) {
    const userInfo = req.user;
    return this.estateService.deleteRecognizedFace(
      recognizedFaceId,
      userInfo.id,
    );
  }
}
