export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  age: number;
  reason: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  age: number | null;
  imageURL: string | null;
  role: string[];
  addresses?: Address[];
}

export interface Address {
  id: number;
  street: string;
  wilaya: string;
  commune: string;
  codePostal: string;
}

export interface AddressRequest {
  street: string;
  wilaya: string;
  commune: string;
  codePostal: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  age?: number | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string>;
}
