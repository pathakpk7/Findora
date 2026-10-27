import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { BadRequestException } from '@nestjs/common';

describe('CloudinaryController', () => {
  let controller: CloudinaryController;

  const mockCloudinaryService = {
    generateSignedUploadParams: jest.fn(),
    uploadImages: jest.fn(),
    deleteImages: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSignUploadParams', () => {
    it('should return signed upload parameters successfully', () => {
      mockCloudinaryService.generateSignedUploadParams.mockReturnValue({
        timestamp: 123456789,
        signature: 'mock-sig',
        folder: 'findora/found-items',
        cloudName: 'test-cloud',
        apiKey: 'test-key',
      });

      const result = controller.getSignUploadParams();

      expect(result).toEqual({
        success: true,
        data: {
          timestamp: 123456789,
          signature: 'mock-sig',
          folder: 'findora/found-items',
          cloudName: 'test-cloud',
          apiKey: 'test-key',
        },
      });
    });
  });

  describe('uploadImages', () => {
    it('should upload images successfully', async () => {
      const mockFiles = [
        {
          path: '/tmp/test1.jpg',
          originalname: 'test1.jpg',
        } as Express.Multer.File,
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
      ]);

      const result = await controller.uploadImages(mockFiles);

      expect(result).toHaveProperty('success', true);
      expect(result.data).toHaveLength(1);
    });

    it('should throw BadRequestException when no files uploaded', async () => {
      await expect(controller.uploadImages([])).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('deleteImages', () => {
    it('should delete images successfully passing req.user context', async () => {
      const deleteDto = { publicIds: ['id1', 'id2'] };
      const req = { user: { id: 'user-123', role: 'USER' } };

      mockCloudinaryService.deleteImages.mockResolvedValue(undefined);

      const result = await controller.deleteImages(req, deleteDto);

      expect(result).toHaveProperty('success', true);
      expect(mockCloudinaryService.deleteImages).toHaveBeenCalledWith(
        ['id1', 'id2'],
        'user-123',
        'USER'
      );
    });
  });
});
