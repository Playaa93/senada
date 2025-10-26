// Base API client with error handling, interceptors, and retry logic

import { ApiError, type ApiResponse } from './types';

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  retry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

interface Interceptors {
  request: ((config: RequestConfig) => RequestConfig | Promise<RequestConfig>)[];
  response: ((response: Response) => Response | Promise<Response>)[];
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private interceptors: Interceptors;
  private token: string | null = null;

  constructor(baseURL?: string) {
    // Use Next.js server as proxy to Cloudflare Worker
    this.baseURL = baseURL || process.env['NEXT_PUBLIC_API_URL'] || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.interceptors = {
      request: [],
      response: [],
    };

    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('api_token');
    }
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('api_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('api_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Interceptor management
  addRequestInterceptor(
    interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  ) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(
    interceptor: (response: Response) => Response | Promise<Response>
  ) {
    this.interceptors.response.push(interceptor);
  }

  // Build URL with query parameters
  private buildURL(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    // If baseURL is empty, use relative paths (for Next.js API routes)
    if (!this.baseURL) {
      const url = new URL(path, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      return url.toString();
    }

    const url = new URL(path, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  // Apply request interceptors
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let modifiedConfig = { ...config };

    for (const interceptor of this.interceptors.request) {
      modifiedConfig = await interceptor(modifiedConfig);
    }

    return modifiedConfig;
  }

  // Apply response interceptors
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response;

    for (const interceptor of this.interceptors.response) {
      modifiedResponse = await interceptor(modifiedResponse);
    }

    return modifiedResponse;
  }

  // Sleep utility for retry delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Core request method with retry logic
  private async request<T>(
    path: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      params,
      retry = true,
      retryAttempts = 3,
      retryDelay = 1000,
      ...fetchConfig
    } = config;

    let lastError: Error | null = null;
    const maxAttempts = retry ? retryAttempts : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Build URL
        const url = this.buildURL(path, params);

        // Prepare headers
        const headers: HeadersInit = {
          ...this.defaultHeaders,
          ...fetchConfig.headers,
        };

        // Add authorization token if available
        if (this.token) {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        // Prepare request config
        let requestConfig: RequestConfig = {
          ...fetchConfig,
          headers,
        };

        // Apply request interceptors
        requestConfig = await this.applyRequestInterceptors(requestConfig);

        // Make the request
        let response = await fetch(url, requestConfig);

        // Apply response interceptors
        response = await this.applyResponseInterceptors(response);

        // Handle non-OK responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: response.statusText,
          }));

          throw new ApiError(
            errorData.message || errorData.error || 'Request failed',
            response.status,
            errorData.code,
            errorData
          );
        }

        // Parse response
        const data: ApiResponse<T> = await response.json();

        if (!data.success) {
          throw new ApiError(
            data.error || data.message || 'Request failed',
            response.status
          );
        }

        return data.data;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === maxAttempts - 1) {
          throw error;
        }

        // Wait before retrying with exponential backoff
        await this.sleep(retryDelay * Math.pow(2, attempt));
      }
    }

    // This should never happen, but TypeScript requires it
    throw lastError || new Error('Request failed');
  }

  // HTTP methods
  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  async post<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };
