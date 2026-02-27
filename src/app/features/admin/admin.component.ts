import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.models';
import { Product, ProductRequest, Category } from '../../core/models/product.models';
import { Order, OrderStatus } from '../../core/models/order.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  activeTab = signal<'users' | 'products' | 'categories' | 'orders'>('users');

  // Users
  users = signal<User[]>([]);
  usersPage = signal(0);
  usersTotalPages = signal(0);
  usersTotalElements = signal(0);
  managingRolesUserId = signal<number | null>(null);
  searchQuery = signal('');
  searchResult = signal<User | null>(null);
  isSearching = signal(false);
  searchActive = signal(false);

  // Products
  products = signal<Product[]>([]);
  productsPage = signal(0);
  productsTotalPages = signal(0);
  productsTotalElements = signal(0);
  showAddProduct = signal(false);
  editingProduct = signal<Product | null>(null);
  productForm = signal<ProductRequest>({ name: '', price: 0, description: '', category: { id: 0, name: '' }, stock: 0 });
  productImageFile = signal<File | null>(null);

  // Categories
  categories = signal<Category[]>([]);
  categoriesPage = signal(0);
  categoriesTotalPages = signal(0);
  showAddCategory = signal(false);
  editingCategory = signal<Category | null>(null);
  categoryName = signal('');

  // Orders
  orders = signal<Order[]>([]);
  ordersPage = signal(0);
  ordersTotalPages = signal(0);
  orderStatuses: OrderStatus[] = ['NEW', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  // Shared
  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Role management
  roleOptions = ['ROLE_USER', 'ROLE_SELLER', 'ROLE_ADMIN'];

  constructor(
    private adminService: AdminService,
    private productService: ProductService,
    private orderService: OrderService,
    public authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  setTab(tab: 'users' | 'products' | 'categories' | 'orders'): void {
    this.activeTab.set(tab);
    this.error.set(null);
    this.successMessage.set(null);
    this.managingRolesUserId.set(null);
    if (tab === 'users' && this.users().length === 0) this.loadUsers();
    if (tab === 'products') {
      if (this.products().length === 0) this.loadProducts();
      if (this.categories().length === 0) this.loadCategories();
    }
    if (tab === 'categories' && this.categories().length === 0) this.loadCategories();
    if (tab === 'orders' && this.orders().length === 0) this.loadOrders();
  }

  // ─── USERS ────────────────────────────────────────────────
  async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await this.adminService.getAllUsers({ page: this.usersPage(), size: 10, sortBy: 'id', direction: 'asc' });
      this.users.set(res.content);
      this.usersTotalPages.set(res.totalPages);
      this.usersTotalElements.set(res.totalElements);
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to load users'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onUsersPageChange(page: number): Promise<void> {
    if (page >= 0 && page < this.usersTotalPages()) {
      this.usersPage.set(page);
      await this.loadUsers();
    }
  }

  async deleteUser(userId: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.error.set(null);
    try {
      await this.adminService.deleteUser(userId);
      this.successMessage.set('User deleted');
      if (this.searchActive() && this.searchResult()?.id === userId) {
        this.clearSearch();
      }
      await this.loadUsers();
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to delete user'));
    }
  }

  // ─── SEARCH USER ──────────────────────────────────────────
  async searchUser(): Promise<void> {
    const query = this.searchQuery().trim();
    if (!query) return;
    this.isSearching.set(true);
    this.error.set(null);
    this.searchResult.set(null);
    try {
      const user = await this.adminService.findUser(query);
      this.searchResult.set(user);
      this.searchActive.set(true);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 404) {
        this.error.set(`No user found for "${query}"`);
      } else {
        this.error.set(this.extractError(err, 'Search failed'));
      }
      this.searchActive.set(true);
    } finally {
      this.isSearching.set(false);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResult.set(null);
    this.searchActive.set(false);
    this.managingRolesUserId.set(null);
  }

  // ─── ROLE MANAGEMENT ──────────────────────────────────────
  toggleManageRoles(userId: number): void {
    this.managingRolesUserId.set(this.managingRolesUserId() === userId ? null : userId);
  }

  /** Normalize role strings — strip "ERole." prefix */
  getUserRoles(roles: string[]): string[] {
    if (!roles) return [];
    return roles.map(r => r.replace('ERole.', ''));
  }

  /** Roles the user does NOT currently have */
  getAvailableRoles(currentRoles: string[]): string[] {
    const normalized = this.getUserRoles(currentRoles);
    return this.roleOptions.filter(r => !normalized.includes(r));
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return 'bg-danger';
      case 'ROLE_SELLER': return 'bg-primary';
      case 'ROLE_USER': return 'bg-secondary';
      default: return 'bg-dark';
    }
  }

  async addRole(userId: number, role: string): Promise<void> {
    this.error.set(null);
    try {
      await this.adminService.setUserRole(userId, role);
      this.successMessage.set(`Set role ${role} for user #${userId}`);
      await this.loadUsers();
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to set role'));
    }
  }

  async removeRole(userId: number, role: string): Promise<void> {
    if (!confirm(`Remove ${role} from user #${userId}?`)) return;
    this.error.set(null);
    try {
      await this.adminService.removeUserRole(userId, role);
      this.successMessage.set(`Removed ${role} from user #${userId}`);
      await this.loadUsers();
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to remove role'));
    }
  }

  // ─── PRODUCTS ─────────────────────────────────────────────
  async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await this.productService.getProducts({ page: this.productsPage(), size: 10, sortBy: 'id', direction: 'asc' });
      this.products.set(res.content);
      this.productsTotalPages.set(res.totalPages);
      this.productsTotalElements.set(res.totalElements);
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to load products'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onProductsPageChange(page: number): Promise<void> {
    if (page >= 0 && page < this.productsTotalPages()) {
      this.productsPage.set(page);
      await this.loadProducts();
    }
  }

  openAddProduct(): void {
    this.editingProduct.set(null);
    this.productForm.set({ name: '', price: 0, description: '', category: { id: 0, name: '' }, stock: 0 });
    this.productImageFile.set(null);
    this.showAddProduct.set(true);
  }

  openEditProduct(product: Product): void {
    this.editingProduct.set(product);
    this.productForm.set({
      name: product.name,
      price: product.price,
      description: product.description,
      category: { id: product.category.id, name: product.category.name },
      stock: product.stock
    });
    this.productImageFile.set(null);
    this.showAddProduct.set(true);
  }

  cancelProductForm(): void {
    this.showAddProduct.set(false);
    this.editingProduct.set(null);
  }

  onProductImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.productImageFile.set(file);
  }

  updateProductForm(field: string, value: any): void {
    const current = this.productForm();
    if (field === 'categoryId') {
      const cat = this.categories().find(c => c.id === +value);
      this.productForm.set({ ...current, category: cat ? { id: cat.id, name: cat.name } : current.category });
    } else {
      this.productForm.set({ ...current, [field]: value });
    }
  }

  async saveProduct(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const editing = this.editingProduct();
      if (editing) {
        await this.productService.updateProduct(editing.id, this.productForm());
        const imgFile = this.productImageFile();
        if (imgFile) {
          await this.productService.uploadProductImage(editing.id, imgFile);
        }
        this.successMessage.set('Product updated');
      } else {
        await this.productService.createProduct(this.productForm(), this.productImageFile() ?? undefined);
        this.successMessage.set('Product created');
      }
      this.cancelProductForm();
      await this.loadProducts();
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to save product'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateStock(productId: number, newStock: number): Promise<void> {
    this.error.set(null);
    try {
      await this.productService.updateProductStock(productId, newStock);
      this.successMessage.set('Stock updated');
      await this.loadProducts();
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to update stock'));
    }
  }

  // ─── CATEGORIES ───────────────────────────────────────────
  async loadCategories(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await this.productService.getCategories({ page: this.categoriesPage(), size: 50, sortBy: 'id', direction: 'asc' });
      this.categories.set(res.content);
      this.categoriesTotalPages.set(res.totalPages);
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to load categories'));
    } finally {
      this.isLoading.set(false);
    }
  }

  openAddCategory(): void {
    this.editingCategory.set(null);
    this.categoryName.set('');
    this.showAddCategory.set(true);
  }

  openEditCategory(cat: Category): void {
    this.editingCategory.set(cat);
    this.categoryName.set(cat.name);
    this.showAddCategory.set(true);
  }

  cancelCategoryForm(): void {
    this.showAddCategory.set(false);
    this.editingCategory.set(null);
    this.categoryName.set('');
  }

  async saveCategory(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const editing = this.editingCategory();
      if (editing) {
        await this.productService.updateCategory(editing.id, { name: this.categoryName() });
        this.successMessage.set('Category updated');
      } else {
        await this.productService.createCategory({ name: this.categoryName() });
        this.successMessage.set('Category created');
      }
      this.cancelCategoryForm();
      await this.loadCategories();
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to save category'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteCategory(id: number): Promise<void> {
    if (!confirm('Delete this category?')) return; this.error.set(null);
    try {
      await this.productService.deleteCategory(id);
      this.successMessage.set('Category deleted');
      await this.loadCategories();
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to delete category'));
    }
  }

  // ─── ORDERS ───────────────────────────────────────────────
  async loadOrders(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const res = await this.orderService.getMyOrders({ page: this.ordersPage(), size: 10, sortBy: 'createdAt', direction: 'desc' });
      this.orders.set(res.content);
      this.ordersTotalPages.set(res.totalPages);
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to load orders'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onOrdersPageChange(page: number): Promise<void> {
    if (page >= 0 && page < this.ordersTotalPages()) {
      this.ordersPage.set(page);
      await this.loadOrders();
    }
  }

  async changeOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
    this.error.set(null);
    try {
      await this.orderService.updateOrderStatus(orderId, status);
      this.successMessage.set('Order status updated');
      await this.loadOrders();
    } catch (err: any) {
      this.error.set(this.extractError(err, 'Failed to update order status'));
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'NEW': return 'bg-info';
      case 'PROCESSING': return 'bg-warning text-dark';
      case 'SHIPPED': return 'bg-primary';
      case 'DELIVERED': return 'bg-success';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────
  getImageUrl(imageURL: string | null): string {
    if (!imageURL) {
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><rect fill="#dee2e6" width="50" height="50"/><text fill="#6c757d" font-family="sans-serif" font-size="8" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">N/A</text></svg>');
    }
    return imageURL.startsWith('http') ? imageURL : `${environment.apiHost}${imageURL}`;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement)?.value || '';
  }

  private extractError(err: any, fallback: string): string {
    const data = err.response?.data;
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (typeof data === 'object' && data !== null) return Object.values(data).join('. ');
    return fallback;
  }
}
