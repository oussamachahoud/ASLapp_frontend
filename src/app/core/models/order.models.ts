export type OrderStatus = 'NEW' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: {
    id: number;
    street: string;
    wilaya: string;
    commune: string;
    codePostal: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderRequest {
  shippingAddressId: number;
  paymentMethod: PaymentMethod;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
