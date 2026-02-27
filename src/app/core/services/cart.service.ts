import { Injectable, signal } from '@angular/core';
import { HttpService } from './http.service';
import { Cart, CartItem } from '../models/cart.models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = signal<Cart | null>(null);
  private isLoading = signal(false);
  private error = signal<string | null>(null);

  readonly cartData = this.cart.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly cartError = this.error.asReadonly();

  constructor(private http: HttpService) {
    this.loadCart();
  }

  async loadCart(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.http.get<Cart>('/cart');
      this.cart.set(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load cart';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addToCart(productId: number, quantity: number): Promise<Cart> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.http.post<Cart>(
        `/cart/add?idProduct=${productId}&quantity=${quantity}`
      );

      this.cart.set(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to add item to cart';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async removeFromCart(cartItemId: number): Promise<Cart> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.http.delete<Cart>(`/cart/remove/${cartItemId}`);
      this.cart.set(response.data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to remove item from cart';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  getCartTotal(): number {
    return this.cart()?.totalPrice ?? 0;
  }

  getCartItemCount(): number {
    return this.cart()?.totalItems ?? 0;
  }

  getCartItems(): CartItem[] {
    return this.cart()?.items ?? [];
  }

  isCartEmpty(): boolean {
    return (this.cart()?.items.length ?? 0) === 0;
  }

  clearError(): void {
    this.error.set(null);
  }
}
