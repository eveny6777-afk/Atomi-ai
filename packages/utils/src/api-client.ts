import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface ApiClientConfig extends AxiosRequestConfig {
  baseURL: string;
  timeout?: number;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      timeout: 10000,
      ...config,
    });
  }

  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get<T>(url, config).then((res) => res.data as T);
  }

  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post<T>(url, data, config).then((res) => res.data as T);
  }

  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put<T>(url, data, config).then((res) => res.data as T);
  }

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete<T>(url, config).then((res) => res.data as T);
  }
}
