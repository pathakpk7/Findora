import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload an image successfully', async () => {
      const mockFile = {
        path: '/tmp/test.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      jest.spyOn(require('cloudinary/v2'), 'uploader').mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          secure_url: 'https://res.cloudinary.com/test/image.jpg',
          public_id: 'test-public-id',
          width: 1200,
          height: 1200,
          format: 'jpg',
          bytes: 100000,
        }),
      });

      const result = await service.uploadImage(mockFile);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('publicId');
      expect(result.url).toBe('https://res.cloudinary.com/test/image.jpg');
    });

    it('should throw BadRequestException on upload failure', async () => {
      const mockFile = {
        path: '/tmp/test.jpg',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      jest.spyOn(require('cloudinary/v2'), 'uploader').mockReturnValue({
        upload: jest.fn().mockRejectedValue(new Error('Upload failed')),
      });

      await expect(service.uploadImage(mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('uploadImages', () => {
    it('should upload multiple images successfully', async () => {
      const mockFiles = [
        { path: '/tmp/test1.jpg', originalname: 'test1.jpg' } as Express.Multer.File,
        { path: '/tmp/test2.jpg', originalname: 'test2.jpg' } as Express.Multer.File,
      ];

      jest.spyOn(service, 'uploadImage').mockResolvedValue({
        url: 'https://res.cloudinary.com/test/image.jpg',
        publicId: 'test-public-id',
        width: 1200,
        height: 1200,
        format: 'jpg',
        bytes: 100000,
      });

      const results = await service.uploadImages(mockFiles);

      expect(results).toHaveLength(2);
      expect(service.uploadImage).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteImage', () => {
    it('should delete an image successfully', async () => {
      jest.spyOn(require('cloudinary/v2'), 'uploader').mockReturnValue({
        destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
      });

      await expect(service.deleteImage('test-public-id')).resolves.not.toThrow();
    });

    it('should throw BadRequestException on delete failure', async () => {
      jest.spyOn(require('cloudinary/v2'), 'uploader').mockReturnValue({
        destroy: jest.fn().mockRejectedValue(new Error('Delete failed')),
      });

      await expect(service.deleteImage('test-public-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteImages', () => {
    it('should delete multiple images successfully', async () => {
      jest.spyOn(service, 'deleteImage').mockResolvedValue();

      await expect(service.deleteImages(['id1', 'id2'])).resolves.not.toThrow();
      expect(service.deleteImage).toHaveBeenCalledTimes(2);
    });
  });
});
