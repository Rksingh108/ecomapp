export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UserRequest {
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  status: OrderStatus;
}

export interface OrderRequest {
  userId: number;
  productId: number;
  quantity: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
