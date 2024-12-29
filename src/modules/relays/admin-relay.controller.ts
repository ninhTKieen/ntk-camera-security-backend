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
import { Relay } from 'src/entities/relay.entity';

import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGetListRelayDto } from './dto/admin-get-list-relay.dto';
import { CreateRelayDto } from './dto/create-relay.dto';
import { DeleteManyRelayDto } from './dto/delete-many-relay.dto';
import { UpdateRelayDto } from './dto/update-relay.dto';
import { RelayService } from './relay.service';

@Controller('api/admin/relays')
@ApiSecurity('access-token')
@ApiTags('Admin Relays')
export class AdminRelaysController {
  constructor(private readonly relayService: RelayService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get all relays' })
  @Get('/get-all')
  @ApiOkResponsePaginated(AdminGetListRelayDto)
  findAll(@Request() req: any, @Query() options: AdminGetListRelayDto) {
    return this.relayService.adminFindAll(options);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create relay' })
  @Post('/create')
  @ApiOkResponseCommon(Relay)
  create(@Request() req: any, @Body() body: CreateRelayDto) {
    return this.relayService.create(body, req.user.id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update relay' })
  @Patch(':id')
  @ApiOkResponseCommon(Relay)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: UpdateRelayDto,
  ) {
    return this.relayService.update(id, body, req.user.id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete relay' })
  @Delete(':id')
  @ApiOkResponseCommon(Boolean)
  delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.relayService.remove(req.user, id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete multiple relays' })
  @Delete('delete-multiple')
  @ApiOkResponseCommon(Boolean)
  deleteMultiple(@Request() req: any, @Body() body: DeleteManyRelayDto) {
    return this.relayService.removeMultiple(req.user, body.ids);
  }
}
