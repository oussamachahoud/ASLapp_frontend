import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, Category } from '../../../core/models/product.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedCategory = signal<string | null>(null);
  searchQuery = signal('');
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  sortBy = signal('id');
  direction = signal<'asc' | 'desc'>('asc');
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
    await this.loadProducts();
  }

  async loadCategories(): Promise<void> {
    try {
      const response = await this.productService.getCategories({ size: 100 });
      this.categories.set(response.content);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      let response;

      if (this.searchQuery()) {
        response = await this.productService.searchProducts(this.searchQuery(), {
          page: this.currentPage(),
          size: this.pageSize(),
          sortBy: this.sortBy(),
          direction: this.direction()
        });
      } else if (this.selectedCategory()) {
        response = await this.productService.getProductsByCategory(this.selectedCategory()!, {
          page: this.currentPage(),
          size: this.pageSize(),
          sortBy: this.sortBy(),
          direction: this.direction()
        });
      } else {
        response = await this.productService.getProducts({
          page: this.currentPage(),
          size: this.pageSize(),
          sortBy: this.sortBy(),
          direction: this.direction()
        });
      }

      this.products.set(response.content);
      this.totalPages.set(response.totalPages);
    } catch (err: any) {
      this.error.set(err.response?.data?.message || 'Failed to load products');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSearch(): Promise<void> {
    this.currentPage.set(0);
    await this.loadProducts();
  }

  async onCategorySelect(categoryName: string | null): Promise<void> {
    this.selectedCategory.set(categoryName);
    this.currentPage.set(0);
    this.searchQuery.set('');
    await this.loadProducts();
  }

  async onSort(field: string): Promise<void> {
    if (this.sortBy() === field) {
      this.direction.set(this.direction() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.direction.set('asc');
    }
    this.currentPage.set(0);
    await this.loadProducts();
  }

  async onPageChange(page: number): Promise<void> {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      await this.loadProducts();
    }
  }

  async addToCart(product: Product): Promise<void> {
    try {
      await this.cartService.addToCart(product.id, 1);
      // Show success message (could use toast notification)
      alert('Product added to cart!');
    } catch (err) {
      alert('Failed to add product to cart');
    }
  }

  getImageUrl(imageURL: string | null): string {
    if (!imageURL) {
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#dee2e6" width="200" height="200"/><text fill="#6c757d" font-family="sans-serif" font-size="14" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No Image</text></svg>');
    }
    return imageURL.startsWith('http')
      ? imageURL
      : `${environment.apiHost}${imageURL}`;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement)?.value || '';
  }
}
