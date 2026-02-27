import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/cart.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems = signal<CartItem[]>([]);
  cartTotal = signal(0);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartItems.set(this.cartService.getCartItems());
    this.cartTotal.set(this.cartService.getCartTotal());
  }

  async removeItem(itemId: number): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.cartService.removeFromCart(itemId);
      this.loadCart();
    } catch (err: any) {
      this.error.set(err.response?.data?.message || 'Failed to remove item');
    } finally {
      this.isLoading.set(false);
    }
  }

  async checkout(): Promise<void> {
    this.router.navigate(['/checkout']);
  }

  getImageUrl(imageURL: string | null): string {
    if (!imageURL) {
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="#dee2e6" width="100" height="100"/><text fill="#6c757d" font-family="sans-serif" font-size="10" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No Image</text></svg>');
    }
    return imageURL.startsWith('http')
      ? imageURL
      : `${environment.apiHost}${imageURL}`;
  }
}
