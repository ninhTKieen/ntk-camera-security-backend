import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { join } from 'path';
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

  @Post('/upload-multiple')
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['images'],
    },
  })
  @ApiOkResponse({
    description: 'Successfully uploaded multiple images',
    type: UploadImageResponseDto,
    isArray: true, // Define response as an array of DTOs
  })
  uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.imageService.uploadMultipleFiles(files);
  }

  @Delete(':publicId')
  @ApiOperation({ summary: 'Delete image' })
  @ApiOkResponseCommon(Boolean)
  @UseGuards(AuthGuard)
  deleteImage(@Param('publicId') publicId: string) {
    return this.imageService.deleteFile(publicId);
  }

  @Get('/known-face/:estateId')
  getFile(@Param('estateId', ParseIntPipe) estateId: number): StreamableFile {
    try {
      const currentFolder = `${process.cwd()}/uploads/estates`;
      const uploadsFolder = `${currentFolder}/${estateId}/known_people`;

      const file = createReadStream(join('', uploadsFolder, 'kien.png'));
      console.log('file', file);
      return new StreamableFile(file);
    } catch (error) {
      console.log('error', error);
    }
  }
}
