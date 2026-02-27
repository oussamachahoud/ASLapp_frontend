import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      await this.loadOrder(parseInt(orderId));
    }
  }

  async loadOrder(id: number): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const orderData = await this.orderService.getOrderById(id);
      this.order.set(orderData);
    } catch (err: any) {
      this.error.set(err.response?.data?.message || 'Failed to load order');
    } finally {
      this.isLoading.set(false);
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'NEW':
        return 'bg-info';
      case 'PROCESSING':
        return 'bg-warning';
      case 'SHIPPED':
        return 'bg-primary';
      case 'DELIVERED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'NEW':
        return 'bi-clock';
      case 'PROCESSING':
        return 'bi-hourglass-split';
      case 'SHIPPED':
        return 'bi-truck';
      case 'DELIVERED':
        return 'bi-check-circle';
      case 'CANCELLED':
        return 'bi-x-circle';
      default:
        return 'bi-question-circle';
    }
  }
}
