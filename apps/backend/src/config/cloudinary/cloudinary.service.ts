import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class CloudinaryService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Generate signed upload parameters for direct Cloudinary client uploads
   */
  generateSignedUploadParams() {
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException(
        'Cloudinary environment configuration is incomplete'
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'findora/found-items';

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    return {
      timestamp,
      signature,
      folder,
      cloudName,
      apiKey,
    };
  }

  /**
   * Upload single image buffer or file through server with validation
   */
  async uploadImage(file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type (${file.mimetype}). Only JPG, PNG, and WebP are allowed.`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds limit (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed is 5MB.`
      );
    }

    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'findora/found-items',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        max_file_size: MAX_FILE_SIZE,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, height: 1200, crop: 'limit' },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload multiple image files with count validation
   */
  async uploadImages(files: Express.Multer.File[]): Promise<any[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided for upload');
    }

    if (files.length > 5) {
      throw new BadRequestException(
        'Maximum 5 images allowed per upload request'
      );
    }

    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete image with IDOR ownership validation
   */
  async deleteImage(
    publicId: string,
    userId?: string,
    userRole?: Role
  ): Promise<void> {
    if (!publicId) return;

    // IDOR Check: If userId is provided and user is not MODERATOR/ADMIN, verify ownership in FoundItem DB
    if (userId && userRole !== Role.MODERATOR && userRole !== Role.ADMIN) {
      const foundItemWithImage = await this.prisma.foundItem.findFirst({
        where: {
          publicImages: {
            has: publicId,
          },
        },
        select: {
          id: true,
          foundById: true,
        },
      });

      if (foundItemWithImage && foundItemWithImage.foundById !== userId) {
        throw new ForbiddenException(
          'You do not have permission to delete an image belonging to another user'
        );
      }
    }

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Delete multiple images with IDOR ownership validation
   */
  async deleteImages(
    publicIds: string[],
    userId?: string,
    userRole?: Role
  ): Promise<void> {
    if (!publicIds || publicIds.length === 0) return;

    const deletePromises = publicIds.map(id =>
      this.deleteImage(id, userId, userRole)
    );
    await Promise.all(deletePromises);
  }
}
