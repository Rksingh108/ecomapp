import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderRequest, Product, ProductRequest, UpdateOrderStatusRequest, User, UserRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  // Angular dev-server proxy forwards /api/* to the Spring Cloud API Gateway.
  private readonly usersUrl = '/api/users';
  private readonly productsUrl = '/api/products';
  private readonly ordersUrl = '/api/orders';

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<User[]> { return this.http.get<User[]>(this.usersUrl); }
  createUser(payload: UserRequest): Observable<User> { return this.http.post<User>(this.usersUrl, payload); }
  updateUser(id: number, payload: UserRequest): Observable<User> { return this.http.put<User>(`${this.usersUrl}/${id}`, payload); }
  deleteUser(id: number): Observable<void> { return this.http.delete<void>(`${this.usersUrl}/${id}`); }

  getProducts(): Observable<Product[]> { return this.http.get<Product[]>(this.productsUrl); }
  createProduct(payload: ProductRequest): Observable<Product> { return this.http.post<Product>(this.productsUrl, payload); }
  updateProduct(id: number, payload: ProductRequest): Observable<Product> { return this.http.put<Product>(`${this.productsUrl}/${id}`, payload); }
  deleteProduct(id: number): Observable<void> { return this.http.delete<void>(`${this.productsUrl}/${id}`); }

  getOrders(): Observable<Order[]> { return this.http.get<Order[]>(this.ordersUrl); }
  createOrder(payload: OrderRequest): Observable<Order> { return this.http.post<Order>(this.ordersUrl, payload); }
  updateOrderStatus(id: number, payload: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.patch<Order>(`${this.ordersUrl}/${id}/status`, payload);
  }
  deleteOrder(id: number): Observable<void> { return this.http.delete<void>(`${this.ordersUrl}/${id}`); }
}
