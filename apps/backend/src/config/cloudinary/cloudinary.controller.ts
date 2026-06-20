import { Controller, Post, Delete, Body, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { DeleteImageDto } from './dto/delete-image.dto';

@ApiTags('cloudinary')
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple images to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await this.cloudinaryService.uploadImages(files);
    return {
      success: true,
      data: results,
    };
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete images from Cloudinary' })
  async deleteImages(@Body() deleteImageDto: DeleteImageDto) {
    await this.cloudinaryService.deleteImages(deleteImageDto.publicIds);
    return {
      success: true,
      message: 'Images deleted successfully',
    };
  }
}
