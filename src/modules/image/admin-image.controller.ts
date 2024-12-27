import { Body, Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseCommon } from 'src/common/common-swagger-response.dto';

import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { DeleteImageDto } from './dto/delete-image-dto';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { ImageService } from './image.service';

@Controller('api/admin/image')
@ApiSecurity('access-token')
@ApiTags('Admin Image')
export class AdminImageController {
  constructor(private readonly imageService: ImageService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Get('/all')
  @ApiOperation({ summary: 'Get all images' })
  @ApiOkResponseCommon(UploadImageResponseDto)
  getAllImages() {
    return this.imageService.getAllImages();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete()
  @ApiOperation({ summary: 'Delete image' })
  @ApiOkResponseCommon(Boolean)
  deleteImage(@Body() body: DeleteImageDto) {
    return this.imageService.deleteFile(body.publicId);
  }
}
