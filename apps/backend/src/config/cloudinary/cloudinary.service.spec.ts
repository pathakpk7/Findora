import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { Role } from '@prisma/client';

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      return config[key];
    }),
  };

  const mockPrismaService = {
    foundItem: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSignedUploadParams', () => {
    it('should generate signed upload parameters successfully', () => {
      jest
        .spyOn(cloudinary.utils, 'api_sign_request')
        .mockReturnValue('mock-signature');

      const params = service.generateSignedUploadParams();

      expect(params).toHaveProperty('timestamp');
      expect(params).toHaveProperty('signature', 'mock-signature');
      expect(params.folder).toBe('findora/found-items');
      expect(params.cloudName).toBe('test-cloud');
      expect(params.apiKey).toBe('test-key');
    });
  });

  describe('uploadImage', () => {
    it('should upload an image successfully when format and size are valid', async () => {
      const mockFile = {
        path: '/tmp/test.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
      } as Express.Multer.File;

      jest.spyOn(cloudinary.uploader, 'upload').mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image.jpg',
        public_id: 'test-public-id',
        width: 1200,
        height: 1200,
        format: 'jpg',
        bytes: 100000,
      } as any);

      const result = await service.uploadImage(mockFile);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('publicId');
      expect(result.url).toBe('https://res.cloudinary.com/test/image.jpg');
    });

    it('should throw BadRequestException if mimetype is not allowed', async () => {
      const mockFile = {
        path: '/tmp/script.sh',
        originalname: 'script.sh',
        mimetype: 'text/plain',
        size: 100,
      } as Express.Multer.File;

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException if file size exceeds 5MB', async () => {
      const mockFile = {
        path: '/tmp/large.jpg',
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024,
      } as Express.Multer.File;

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('deleteImage IDOR Security', () => {
    it('should allow owner to delete their own image', async () => {
      mockPrismaService.foundItem.findFirst.mockResolvedValue({
        id: 'item-1',
        foundById: 'user-123',
      });

      jest
        .spyOn(cloudinary.uploader, 'destroy')
        .mockResolvedValue({ result: 'ok' } as any);

      await expect(
        service.deleteImage(
          'findora/found-items/test-id',
          'user-123',
          Role.USER
        )
      ).resolves.not.toThrow();
    });

    it('should throw ForbiddenException if user tries to delete another user image', async () => {
      mockPrismaService.foundItem.findFirst.mockResolvedValue({
        id: 'item-1',
        foundById: 'owner-456',
      });

      await expect(
        service.deleteImage(
          'findora/found-items/test-id',
          'attacker-789',
          Role.USER
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow MODERATOR to delete any image', async () => {
      mockPrismaService.foundItem.findFirst.mockResolvedValue({
        id: 'item-1',
        foundById: 'owner-456',
      });

      jest
        .spyOn(cloudinary.uploader, 'destroy')
        .mockResolvedValue({ result: 'ok' } as any);

      await expect(
        service.deleteImage(
          'findora/found-items/test-id',
          'mod-1',
          Role.MODERATOR
        )
      ).resolves.not.toThrow();
    });
  });
});
