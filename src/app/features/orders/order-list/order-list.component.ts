import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  orders = signal<Order[]>([]);
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private orderService: OrderService) {}

  async ngOnInit(): Promise<void> {
    await this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.orderService.getMyOrders({
        page: this.currentPage(),
        size: this.pageSize(),
        sortBy: 'createdAt',
        direction: 'desc'
      });

      this.orders.set(response.content);
      this.totalPages.set(response.totalPages);
    } catch (err: any) {
      this.error.set(err.response?.data?.message || 'Failed to load orders');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onPageChange(page: number): Promise<void> {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      await this.loadOrders();
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
}
