import { storage } from '../storage';

// Mock Platform for testing
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web', // Test web platform
  },
}));

// Mock localStorage for web testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CrossPlatformStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use localStorage on web platform', async () => {
    const key = 'test-key';
    const value = 'test-value';

    // Test setItemAsync
    await storage.setItemAsync(key, value);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(key, value);

    // Test getItemAsync
    localStorageMock.getItem.mockReturnValue(value);
    const result = await storage.getItemAsync(key);
    expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
    expect(result).toBe(value);

    // Test deleteItemAsync
    await storage.deleteItemAsync(key);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(key);
  });
});