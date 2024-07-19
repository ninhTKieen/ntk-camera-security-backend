import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkResponseCommon } from 'src/common/common-swagger-response.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { ImageService } from './image.service';

@Controller('api/image')
@ApiSecurity('access-token')
@ApiTags('Image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['image'],
    },
  })
  @ApiOkResponseCommon(UploadImageResponseDto)
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.imageService.uploadFile(file);
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete image' })
  @ApiOkResponseCommon(Boolean)
  @UseGuards(AuthGuard)
  deleteImage(@Param('publicId') publicId: string) {
    return this.imageService.deleteFile(publicId);
  }
}
