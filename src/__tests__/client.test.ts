import axios from 'axios';
import axiosRetry from 'axios-retry';
import { AppUpgradeClient } from '../client';

// Mock axios and axios-retry
jest.mock('axios', () => {
  return {
    create: jest.fn().mockReturnValue('mock-axios-instance'),
  };
});

jest.mock('axios-retry', () => {
  const fn = Object.assign(jest.fn(), {
    exponentialDelay: jest.fn(),
    isNetworkError: jest.fn(),
    isRetryableError: jest.fn(),
  });
  return {
    __esModule: true,
    default: fn,
  };
});

describe('AppUpgradeClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize axios with default BASE_URL when not provided', () => {
    const client = new AppUpgradeClient({ apiKey: 'test-key' });

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://appupgrade.dev',
      timeout: 5000,
      headers: {
        'x-api-key': 'test-key',
        sdk: 'react-native-ts@2.0.0',
      },
    });

    expect(client.getHttp()).toBe('mock-axios-instance');
  });

  it('should initialize axios with custom BASE_URL when provided', () => {
    new AppUpgradeClient({ apiKey: 'test-key', baseURL: 'https://custom.test.com' });

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://custom.test.com',
      timeout: 5000,
      headers: {
        'x-api-key': 'test-key',
        sdk: 'react-native-ts@2.0.0',
      },
    });
  });

  it('should configure axiosRetry correctly', () => {
    new AppUpgradeClient({ apiKey: 'test-key' });

    expect(axiosRetry).toHaveBeenCalledTimes(1);
    expect(axiosRetry).toHaveBeenCalledWith(
      'mock-axios-instance',
      expect.objectContaining({
        retries: 3,
        retryDelay: expect.any(Function),
        retryCondition: expect.any(Function),
      })
    );

    // Verify retry condition function calls underlying axiosRetry methods
    const callArgs = (axiosRetry as unknown as jest.Mock).mock.calls[0][1];
    const retryCondition = callArgs.retryCondition;

    const mockError = new Error('Test Error');
    (axiosRetry.isNetworkError as jest.Mock).mockReturnValue(true);
    (axiosRetry.isRetryableError as jest.Mock).mockReturnValue(false);

    expect(retryCondition(mockError)).toBe(true);
    expect(axiosRetry.isNetworkError).toHaveBeenCalledWith(mockError);
  });
});
