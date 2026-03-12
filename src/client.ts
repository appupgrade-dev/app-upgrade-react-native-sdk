import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

const BASE_URL = 'https://appupgrade.dev';
const SDK_VERSION = '2.0.0';

type ClientOptions = {
    apiKey: string;
    baseURL?: string;
    debug?: boolean;
};

export class AppUpgradeClient {
    private http: AxiosInstance;
    private apiKey: string;
    private debug: boolean;

    constructor(options: ClientOptions) {
        this.apiKey = options.apiKey;
        this.debug = options.debug ?? false;

        this.http = axios.create({
            baseURL: options.baseURL ?? BASE_URL,
            timeout: 5000,
            headers: {
                'x-api-key': this.apiKey,
                sdk: `react-native-ts@${SDK_VERSION}`,
            },
        });

        axiosRetry(this.http, {
            retries: 3,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) =>
                axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error),
        });
    }

    getHttp(): AxiosInstance {
        return this.http;
    }

    isDebug(): boolean {
        return this.debug;
    }
}
