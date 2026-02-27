import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { PlaceOrderRequest, PaymentMethod } from '../../../core/models/order.models';
import { Address } from '../../../core/models/auth.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  addresses = signal<Address[]>([]);
  selectedAddressId = signal<number | null>(null);
  selectedPaymentMethod = signal<PaymentMethod>('CASH_ON_DELIVERY');
  paymentMethods: PaymentMethod[] = ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'];

  cartTotal = signal(0);
  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
    this.cartTotal.set(this.cartService.getCartTotal());
  }

  loadAddresses(): void {
    const user = this.authService.user();
    if (user?.addresses) {
      this.addresses.set(user.addresses);
      if (user.addresses.length > 0) {
        this.selectedAddressId.set(user.addresses[0].id);
      }
    }
  }

  async placeOrder(): Promise<void> {
    this.error.set(null);

    if (!this.selectedAddressId()) {
      this.error.set('Please select a shipping address');
      return;
    }

    this.isLoading.set(true);

    try {
      const orderData: PlaceOrderRequest = {
        shippingAddressId: this.selectedAddressId()!,
        paymentMethod: this.selectedPaymentMethod()
      };

      const order = await this.orderService.placeOrder(orderData);
      this.successMessage.set(`Order placed successfully! Order #${order.orderNumber}`);

      // Refresh cart
      await this.cartService.loadCart();

      // Redirect to order details after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/orders', order.id]);
      }, 2000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to place order';
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async navigateToAddAddress(): Promise<void> {
    this.router.navigate(['/profile']);
  }
}
