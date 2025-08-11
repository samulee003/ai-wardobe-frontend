import imageOptimizer from '../../utils/imageOptimization';

// Mock canvas and image（僅在此測試檔生效）
let mockImage;
let mockCanvas;
beforeEach(() => {
  // Canvas mock
  mockCanvas = {
    width: 0,
    height: 0,
    getContext: jest.fn(() => ({ drawImage: jest.fn() })),
    toBlob: jest.fn((callback, type, quality) => {
      const blob = new Blob(['mock-image-data'], { type });
      callback(blob);
    }),
    toDataURL: jest.fn(() => 'data:image/webp;base64,mock')
  };

  const realCreate = document.createElement.bind(document);
  jest.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag === 'canvas') return mockCanvas;
    if (tag === 'img' || tag === 'image') return { ...mockImage };
    return realCreate(tag);
  });

  // Image mock
  mockImage = {
    width: 1000,
    height: 800,
    onload: null,
    onerror: null,
    src: ''
  };
});

afterEach(() => {
  jest.restoreAllMocks();
});

global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('ImageOptimizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateDimensions', () => {
    test('should maintain aspect ratio when scaling down', () => {
      const result = imageOptimizer.calculateDimensions(1000, 800, 500, 400);
      
      expect(result.width).toBe(500);
      expect(result.height).toBe(400);
    });

    test('should not scale up small images', () => {
      const result = imageOptimizer.calculateDimensions(300, 200, 800, 600);
      
      expect(result.width).toBe(300);
      expect(result.height).toBe(200);
    });

    test('should maintain aspect ratio with different constraints', () => {
      const result = imageOptimizer.calculateDimensions(1000, 500, 400, 400);
      
      expect(result.width).toBe(400);
      expect(result.height).toBe(200);
    });
  });

  describe('isValidImageFormat', () => {
    test('should accept valid image formats', () => {
      const validFormats = [
        { type: 'image/jpeg' },
        { type: 'image/jpg' },
        { type: 'image/png' },
        { type: 'image/gif' },
        { type: 'image/webp' }
      ];

      validFormats.forEach(file => {
        expect(imageOptimizer.isValidImageFormat(file)).toBe(true);
      });
    });

    test('should reject invalid formats', () => {
      const invalidFormats = [
        { type: 'text/plain' },
        { type: 'application/pdf' },
        { type: 'video/mp4' }
      ];

      invalidFormats.forEach(file => {
        expect(imageOptimizer.isValidImageFormat(file)).toBe(false);
      });
    });
  });

  describe('isValidFileSize', () => {
    test('should accept files within size limit', () => {
      const validFile = { size: 5 * 1024 * 1024 }; // 5MB
      expect(imageOptimizer.isValidFileSize(validFile, 10)).toBe(true);
    });

    test('should reject files exceeding size limit', () => {
      const invalidFile = { size: 15 * 1024 * 1024 }; // 15MB
      expect(imageOptimizer.isValidFileSize(invalidFile, 10)).toBe(false);
    });
  });

  describe('compressImage', () => {
    test('should compress image successfully', async () => {
      const mockFile = new File(['mock-data'], 'test.jpg', { type: 'image/jpeg' });
      
      // 模擬圖片載入成功
      setTimeout(() => mockImage.onload && mockImage.onload(), 0);

      jest.setTimeout(10000);
      const result = await imageOptimizer.compressImage(mockFile);
      
      expect(result).toBeInstanceOf(Blob);
      expect(mockCanvas.getContext).toHaveBeenCalled();
    });

    test('should handle image load error', async () => {
      const mockFile = new File(['mock-data'], 'test.jpg', { type: 'image/jpeg' });
      
      // 模擬圖片載入錯誤
      mockImage.onload = null;
      setTimeout(() => mockImage.onerror && mockImage.onerror(new Error('圖片載入失敗')), 0);

      jest.setTimeout(10000);
      await expect(imageOptimizer.compressImage(mockFile)).rejects.toThrow('圖片載入失敗');
    });
  });

  describe('estimateCompressedSize', () => {
    test('should estimate compressed size correctly', () => {
      const originalSize = 1000000; // 1MB
      const quality = 0.8;
      
      const estimated = imageOptimizer.estimateCompressedSize(originalSize, quality);
      
      expect(estimated).toBeLessThan(originalSize);
      expect(estimated).toBeGreaterThan(0);
    });
  });

  describe('supportsWebP', () => {
    test('should detect WebP support', () => {
      // Mock canvas toDataURL
      mockCanvas.toDataURL = jest.fn(() => 'data:image/webp;base64,mock-data');
      
      const supports = imageOptimizer.supportsWebP();
      expect(typeof supports).toBe('boolean');
    });
  });

  describe('batchProcess', () => {
    test('should process multiple files', async () => {
      const mockFiles = [
        new File(['data1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['data2'], 'test2.png', { type: 'image/png' })
      ];

      // Mock successful processing
      jest.spyOn(imageOptimizer, 'compressImage').mockResolvedValue(new Blob(['compressed']));
      jest.spyOn(imageOptimizer, 'getImageInfo').mockResolvedValue({
        width: 800,
        height: 600,
        fileSize: 1000
      });

      const results = await imageOptimizer.batchProcess(mockFiles);
      
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('compressed');
      expect(results[0]).toHaveProperty('info');
    });

    test('should handle invalid files in batch', async () => {
      const mockFiles = [
        new File(['data'], 'test.txt', { type: 'text/plain' })
      ];

      const results = await imageOptimizer.batchProcess(mockFiles);
      
      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty('error', '不支持的圖片格式');
    });
  });
});