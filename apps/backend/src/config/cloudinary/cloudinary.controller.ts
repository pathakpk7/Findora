import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DeleteImageDto } from './dto/delete-image.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('cloudinary')
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('sign-upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Generate signed Cloudinary upload parameters for authenticated client direct upload',
  })
  getSignUploadParams() {
    return {
      success: true,
      data: this.cloudinaryService.generateSignedUploadParams(),
    };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiOperation({
    summary:
      'Upload multiple images through server to Cloudinary (Max 5 files, 5MB each)',
  })
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete images from Cloudinary with IDOR security check',
  })
  async deleteImages(
    @Request() req: any,
    @Body() deleteImageDto: DeleteImageDto
  ) {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    await this.cloudinaryService.deleteImages(
      deleteImageDto.publicIds,
      userId,
      userRole
    );
    return {
      success: true,
      message: 'Images deleted successfully',
    };
  }
}
