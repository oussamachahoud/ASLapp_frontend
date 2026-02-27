import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { User } from '../models/auth.models';
import { PaginatedResponse, PageParams } from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpService) {}

  async getAllUsers(params?: PageParams): Promise<PaginatedResponse<User>> {
    const qp = new URLSearchParams();
    if (params?.page !== undefined) qp.append('page', params.page.toString());
    if (params?.size !== undefined) qp.append('size', params.size.toString());
    if (params?.sortBy) qp.append('sortBy', params.sortBy);
    if (params?.direction) qp.append('direction', params.direction);

    const response = await this.http.get<PaginatedResponse<User>>(`/users/alluser?${qp.toString()}`);
    return response.data;
  }
  async getUsersWithAddresses(params?: PageParams): Promise<PaginatedResponse<User>> {
    const qp = new URLSearchParams();
    if (params?.page !== undefined) qp.append('page', params.page.toString());
    if (params?.size !== undefined) qp.append('size', params.size.toString());
    if (params?.sortBy) qp.append('sortBy', params.sortBy);
    if (params?.direction) qp.append('direction', params.direction);

    const response = await this.http.get<PaginatedResponse<User>>(`/users/users-with-addresses?${qp.toString()}`);
    return response.data;
  }

  async findUser(query: string): Promise<User> {
    const response = await this.http.get<User>(`/users/find?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  async setUserRole(id: number, role: string): Promise<any> {
    const response = await this.http.patch(`/users/setrole/${id}`, { role });
    return response.data;
  }

  async removeUserRole(id: number, role: string): Promise<any> {
    const response = await this.http.patch(`/users/removerole/${id}`, { role });
    return response.data;
  }

  async deleteUser(id: number): Promise<string> {
    const response = await this.http.delete<string>(`/users/Delete/${id}`);
    return response.data;
  }
}
