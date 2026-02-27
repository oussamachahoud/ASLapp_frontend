import { Injectable, signal } from '@angular/core';
import { HttpService } from './http.service';
import { User, SignupRequest, LoginRequest, AuthResponse, UpdateUserRequest, AddressRequest, Address } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal(false);
  private isLoading = signal(false);
  private error = signal<string | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly authenticated = this.isAuthenticated.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly authError = this.error.asReadonly();

  constructor(private http: HttpService) {
    this.checkAuthStatus();
  }

  async signup(data: SignupRequest): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.http.post<AuthResponse>('/auth/signup', data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async login(credentials: LoginRequest): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.http.post('/auth/login', credentials);
      await this.fetchCurrentUser();
      this.isAuthenticated.set(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.http.post('/auth/logout', {});
      this.clearAuth();
    } catch (err) {
      this.clearAuth();
      throw err;
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await this.http.post('/auth/logoutall', {});
      this.clearAuth();
    } catch (err) {
      this.clearAuth();
      throw err;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    this.isLoading.set(true);

    try {
      await this.http.get(`/auth/verify?token=${token}`);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Email verification failed';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async refreshToken(): Promise<void> {
    try {
      await this.http.post('/auth/refresh', {});
    } catch (err) {
      this.clearAuth();
      throw err;
    }
  }

  async fetchCurrentUser(): Promise<void> {
    try {
      const response = await this.http.get<User>('/users/me');
      this.currentUser.set(response.data);
      this.isAuthenticated.set(true);
    } catch (err) {
      this.clearAuth();
      throw err;
    }
  }

  async updateProfile(data: UpdateUserRequest): Promise<User> {
    try {
      const response = await this.http.patch<User>('/users/me', data);
      this.currentUser.set(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Update failed';
      this.error.set(message);
      throw err;
    }
  }

  async uploadProfileImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const user = this.currentUser();
      if (!user) throw new Error('User not found');

      const response = await this.http.post<{ message: string }>(`/users/${user.id}/update-image`, formData, {
        headers: { 'Content-Type': undefined as any }
      });

      // Fetch updated user to get new image URL
      await this.fetchCurrentUser();
      return response.data.message;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Image upload failed';
      this.error.set(message);
      throw err;
    }
  }

  async addAddress(address: AddressRequest): Promise<Address> {
    try {
      const response = await this.http.post<Address>('/users/me/address', address);
      await this.fetchCurrentUser();
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Add address failed';
      this.error.set(message);
      throw err;
    }
  }

  async deleteAddress(addressId: number): Promise<void> {
    try {
      await this.http.delete(`/users/me/address/${addressId}`);
      await this.fetchCurrentUser();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Delete address failed';
      this.error.set(message);
      throw err;
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await this.http.delete('/users/me');
      this.clearAuth();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Delete account failed';
      this.error.set(message);
      throw err;
    }
  }

  private checkAuthStatus(): void {
    this.fetchCurrentUser()
      .then(() => this.isAuthenticated.set(true))
      .catch(() => {
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
      });
  }

  private clearAuth(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.error.set(null);
  }

  hasRole(role: string): boolean {
    const userRoles = this.currentUser()?.role ?? [];
    return userRoles.some(r => r === role || r === `ERole.${role}` || r.endsWith(`.${role}`));
  }

  hasAnyRole(...roles: string[]): boolean {
    const userRoles = this.currentUser()?.role ?? [];
    return roles.some(role =>
      userRoles.some(r => r === role || r === `ERole.${role}` || r.endsWith(`.${role}`))
    );
  }
}
