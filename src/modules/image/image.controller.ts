import {
  Controller,
  Post,
  UploadedFile,
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

import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { ImageService } from './image.service';

@Controller('image')
@ApiSecurity('access-token')
@ApiTags('image')
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
}
