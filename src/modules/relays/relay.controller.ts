import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/common-swagger-response.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { GetListRelayDto } from './dto/get-list-relay.dto';
import { RelayService } from './relay.service';

@Controller('api/relays')
@ApiSecurity('access-token')
@ApiTags('Relays')
export class RelaysController {
  constructor(private readonly relayService: RelayService) {}

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @Get('/get-all')
  @ApiOkResponsePaginated(GetListRelayDto)
  findAll(@Request() req: any, @Query() options: GetListRelayDto) {
    return this.relayService.findAll(options, req.user.id);
  }
}
