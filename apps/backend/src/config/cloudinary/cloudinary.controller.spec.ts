import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { BadRequestException } from '@nestjs/common';

describe('CloudinaryController', () => {
  let controller: CloudinaryController;
  let service: CloudinaryService;

  const mockCloudinaryService = {
    uploadImages: jest.fn(),
    deleteImages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudinaryController],
      providers: [
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    controller = module.get<CloudinaryController>(CloudinaryController);
    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImages', () => {
    it('should upload images successfully', async () => {
      const mockFiles = [
        { path: '/tmp/test1.jpg', originalname: 'test1.jpg' } as Express.Multer.File,
        { path: '/tmp/test2.jpg', originalname: 'test2.jpg' } as Express.Multer.File,
      ];

      mockCloudinaryService.uploadImages.mockResolvedValue([
        {
          url: 'https://res.cloudinary.com/test/image1.jpg',
          publicId: 'id1',
          width: 1200,
          height: 1200,
          format: 'jpg',
          bytes: 100000,
        },
        {
          url: 'https://res.cloudinary.com/test/image2.jpg',
          publicId: 'id2',
          width: 1200,
          height: 1200,
          format: 'jpg',
          bytes: 100000,
        },
      ]);

      const result = await controller.uploadImages(mockFiles);

      expect(result).toHaveProperty('success', true);
      expect(result.data).toHaveLength(2);
      expect(mockCloudinaryService.uploadImages).toHaveBeenCalledWith(mockFiles);
    });

    it('should throw BadRequestException when no files uploaded', async () => {
      await expect(controller.uploadImages([])).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteImages', () => {
    it('should delete images successfully', async () => {
      const deleteDto = { publicIds: ['id1', 'id2'] };

      mockCloudinaryService.deleteImages.mockResolvedValue();

      const result = await controller.deleteImages(deleteDto);

      expect(result).toHaveProperty('success', true);
      expect(result.message).toBe('Images deleted successfully');
      expect(mockCloudinaryService.deleteImages).toHaveBeenCalledWith(['id1', 'id2']);
    });
  });
});
