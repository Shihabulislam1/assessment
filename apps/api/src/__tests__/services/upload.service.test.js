import { jest } from '@jest/globals';

const mockCloudinary = {
  uploader: {
    upload_stream: jest.fn(),
  },
};

jest.unstable_mockModule('cloudinary', () => ({
  v2: mockCloudinary,
}));

// Mock the config so it doesn't try to initialize with missing env vars
jest.unstable_mockModule('../../config/cloudinary.js', () => ({
  default: mockCloudinary,
}));

const {
  uploadToCloudinary,
} = await import('../../services/upload.service.js');

describe('Upload Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadToCloudinary', () => {
    it('uploads a buffer to cloudinary via stream', async () => {
      const buffer = Buffer.from('test');
      const mockResult = { secure_url: 'http://res.cloudinary.com/test.jpg' };
      
      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        // Return a mock stream object that calls the callback when end() is called
        return {
          end: (buf) => {
            callback(null, mockResult);
          }
        };
      });

      const result = await uploadToCloudinary(buffer);

      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(result.secure_url).toBe(mockResult.secure_url);
    });

    it('handles cloudinary errors', async () => {
      const buffer = Buffer.from('test');
      const mockError = new Error('Cloudinary failed');
      
      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        return {
          end: (buf) => {
            callback(mockError, null);
          }
        };
      });

      await expect(uploadToCloudinary(buffer)).rejects.toThrow('Cloudinary failed');
    });
  });
});
