import { Injectable, signal } from '@angular/core';
import { HttpService } from './http.service';
import { Order, PlaceOrderRequest, UpdateOrderStatusRequest, OrderStatus } from '../models/order.models';
import { PaginatedResponse, PageParams } from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders = signal<Order[]>([]);
  private isLoading = signal(false);
  private error = signal<string | null>(null);

  readonly ordersList = this.orders.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly orderError = this.error.asReadonly();

  constructor(private http: HttpService) {}

  async placeOrder(data: PlaceOrderRequest): Promise<Order> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.http.post<Order>('/orders/place', data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to place order';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getMyOrders(params?: PageParams): Promise<PaginatedResponse<Order>> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.direction) queryParams.append('direction', params.direction);

      const response = await this.http.get<PaginatedResponse<Order>>(
        `/orders?${queryParams.toString()}`
      );

      this.orders.set(response.data.content);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch orders';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getOrderById(id: number): Promise<Order> {
    try {
      const response = await this.http.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch order';
      this.error.set(message);
      throw err;
    }
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    try {
      const response = await this.http.put<Order>(
        `/orders/admin/${orderId}/status`,
        { status }
      );
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update order status';
      this.error.set(message);
      throw err;
    }
  }
}
