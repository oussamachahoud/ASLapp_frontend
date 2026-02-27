export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageURL: string | null;
  category: Category;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductRequest {
  name: string;
  price: number;
  description: string;
  category: Category;
  stock: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  description: string;
  imageURL: string | null;
  category: Category;
  stock: number;
}

export interface CategoryRequest {
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}
