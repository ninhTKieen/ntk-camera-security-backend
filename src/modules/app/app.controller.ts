import { Controller, Get } from '@nestjs/common';
import { Redirect } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @Redirect('/api/docs')
  @ApiExcludeEndpoint()
  getHello(): string {
    return 'Hello';
  }
}
