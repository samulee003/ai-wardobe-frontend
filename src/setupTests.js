// Jest setup for CRA
import '@testing-library/jest-dom';

// URL mocks
if (!global.URL) {
  global.URL = {};
}
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock axios ESM to avoid Jest transform issues in node_modules
// Prefer the CommonJS build for tests
// If this path fails in the future, fall back to a manual mock
jest.mock('axios', () => {
  try {
    // axios v1 provides a CJS bundle for Node
    // eslint-disable-next-line global-require
    return require('axios/dist/node/axios.cjs');
  } catch (e) {
    return {
      __esModule: true,
      default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
  }
});

// Simplify LazyImage to a plain <img> in tests to avoid IntersectionObserver and styled issues
jest.mock('./components/LazyImage', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('img', { 'data-testid': 'clothing-image', ...props }),
  };
});

// 提供全域 Canvas 與 Image 簡易 mock，供需要的模組使用（如 imageOptimization）
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({ drawImage: jest.fn() })),
  toBlob: jest.fn((cb, type = 'image/jpeg') => cb(new Blob(['mock'], { type }))),
  toDataURL: jest.fn(() => 'data:image/webp;base64,MOCK'),
};

const realCreateElement = document.createElement.bind(document);
jest.spyOn(document, 'createElement').mockImplementation((tag) => {
  if (tag === 'canvas') return mockCanvas;
  return realCreateElement(tag);
});

class MockImage {
  constructor() {
    this.width = 1000;
    this.height = 800;
    this.onload = null;
    this.onerror = null;
    this._src = '';
  }
  set src(val) {
    this._src = val;
    setTimeout(() => this.onload && this.onload());
  }
  get src() { return this._src; }
}
global.Image = MockImage;


