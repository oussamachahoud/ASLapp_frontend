import { Injectable, signal } from '@angular/core';
import { HttpService } from './http.service';
import { Product, ProductRequest, ProductResponse, Category, CategoryRequest, CategoryResponse, PaginatedResponse, PageParams } from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products = signal<Product[]>([]);
  private categories = signal<Category[]>([]);
  private isLoading = signal(false);
  private error = signal<string | null>(null);

  readonly productsList = this.products.asReadonly();
  readonly categoriesList = this.categories.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly productError = this.error.asReadonly();

  constructor(private http: HttpService) {}

  async getProducts(params?: PageParams): Promise<PaginatedResponse<Product>> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.direction) queryParams.append('direction', params.direction);

      const response = await this.http.get<PaginatedResponse<Product>>(
        `/products?${queryParams.toString()}`
      );

      this.products.set(response.data.content);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch products';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await this.http.get<Product>(`/products/${id}`);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch product';
      this.error.set(message);
      throw err;
    }
  }

  async searchProducts(query: string, params?: PageParams): Promise<PaginatedResponse<Product>> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.direction) queryParams.append('direction', params.direction);

      const response = await this.http.get<PaginatedResponse<Product>>(
        `/products/search?${queryParams.toString()}`
      );

      this.products.set(response.data.content);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Search failed';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getProductsByCategory(category: string, params?: PageParams): Promise<PaginatedResponse<Product>> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.direction) queryParams.append('direction', params.direction);

      const response = await this.http.get<PaginatedResponse<Product>>(
        `/products/category/${category}?${queryParams.toString()}`
      );

      this.products.set(response.data.content);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch products by category';
      this.error.set(message);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async createProduct(data: ProductRequest, imageFile?: File): Promise<ProductResponse> {
    try {
      const formData = new FormData();
      formData.append('produit', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      if (imageFile) {
        formData.append('file', imageFile);
      }

      const response = await this.http.post<ProductResponse>(
        '/products/add-produit',
        formData,
        { headers: { 'Content-Type': undefined as any } }
      );

      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create product';
      this.error.set(message);
      throw err;
    }
  }

  async updateProduct(id: number, data: ProductRequest): Promise<ProductResponse> {
    try {
      const response = await this.http.put<ProductResponse>(`/products/${id}`, data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update product';
      this.error.set(message);
      throw err;
    }
  }

  async updateProductStock(id: number, stock: number): Promise<ProductResponse> {
    try {
      const response = await this.http.patch<ProductResponse>(
        `/products/${id}/stock?stock=${stock}`
      );
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update stock';
      this.error.set(message);
      throw err;
    }
  }

  async uploadProductImage(id: number, imageFile: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await this.http.post<{ message: string }>(
        `/products/${id}/update-image`,
        formData,
        { headers: { 'Content-Type': undefined as any } }
      );

      return response.data.message;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Image upload failed';
      this.error.set(message);
      throw err;
    }
  }

  async getCategories(params?: PageParams): Promise<PaginatedResponse<Category>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.direction) queryParams.append('direction', params.direction);

      const response = await this.http.get<PaginatedResponse<Category>>(
        `/category/all?${queryParams.toString()}`
      );

      this.categories.set(response.data.content);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch categories';
      this.error.set(message);
      throw err;
    }
  }

  async createCategory(data: CategoryRequest): Promise<CategoryResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('name', data.name);
      const response = await this.http.post<CategoryResponse>(`/category?${queryParams.toString()}`, null);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create category';
      this.error.set(message);
      throw err;
    }
  }

  async updateCategory(id: number, data: CategoryRequest): Promise<CategoryResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('name', data.name);
      const response = await this.http.patch<CategoryResponse>(`/category/${id}?${queryParams.toString()}`, null);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update category';
      this.error.set(message);
      throw err;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      await this.http.delete(`/category/${id}`);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete category';
      this.error.set(message);
      throw err;
    }
  }
}
