import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: environment.apiBaseUrl,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Response interceptor for token refresh on 401
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.axiosInstance.post('/auth/refresh');
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Redirect to login if refresh fails
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: any) {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.axiosInstance.delete<T>(url, config);
  }

  getAxiosInstance() {
    return this.axiosInstance;
  }
}
