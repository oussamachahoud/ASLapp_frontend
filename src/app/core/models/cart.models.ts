export interface CartItem {
  id: number;
  quantity: number;
  unitPrice: number;
  productId: number;
  productName: string;
  productImage: string | null;
  subtotal: number;
}

export interface Cart {
  id: number;
  totalPrice: number;
  totalItems: number;
  items: CartItem[];
}

export interface AddToCartRequest {
  idProduct: number;
  quantity: number;
}
