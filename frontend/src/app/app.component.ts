import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Order, OrderStatus, Product, ProductRequest, User } from './models';

type Section = 'overview' | 'products' | 'orders' | 'customers';
type ToastType = 'success' | 'error' | 'info';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnDestroy, OnInit {
  section = signal<Section>('overview');
  users = signal<User[]>([]);
  products = signal<Product[]>([]);
  orders = signal<Order[]>([]);
  loading = signal(false);
  search = signal('');
  toast = signal<{ message: string; type: ToastType } | null>(null);
  showProductForm = signal(false);
  showCustomerForm = signal(false);
  showOrderForm = signal(false);
  savingProduct = signal(false);
  savingCustomer = signal(false);
  savingOrder = signal(false);
  updatingOrderIds = signal<ReadonlySet<number>>(new Set());
  editingProductId = signal<number | null>(null);
  editingUserId = signal<number | null>(null);
  private toastTimeout: ReturnType<typeof setTimeout> | undefined;

  productForm: ProductRequest = this.emptyProduct();
  customerForm = { name: '', email: '' };
  orderForm = { userId: 0, productId: 0, quantity: 1 };
  orderStatuses: OrderStatus[] = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  filteredProducts = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.products().filter(p => !q || `${p.name} ${p.description ?? ''}`.toLowerCase().includes(q));
  });
  filteredUsers = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.users().filter(u => !q || `${u.name} ${u.email}`.toLowerCase().includes(q));
  });
  filteredOrders = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.orders().filter(o => !q || `${o.id} ${o.userId} ${o.productId} ${o.status}`.toLowerCase().includes(q));
  });
  totalRevenue = computed(() => this.orders().reduce((sum, order) => {
    const product = this.products().find(p => p.id === order.productId);
    return sum + (product?.price ?? 0) * order.quantity;
  }, 0));
  lowStock = computed(() => this.products().filter(p => p.stock < 10).length);

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void { this.refreshAll(); }

  ngOnDestroy(): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  refreshAll(): void {
    if (this.loading()) return;
    this.loading.set(true);
    forkJoin({
      users: this.api.getUsers().pipe(catchError(error => {
        this.reportError('Customers', error);
        return of(null);
      })),
      products: this.api.getProducts().pipe(catchError(error => {
        this.reportError('Products', error);
        return of(null);
      })),
      orders: this.api.getOrders().pipe(catchError(error => {
        this.reportError('Orders', error);
        return of(null);
      }))
    }).pipe(finalize(() => this.loading.set(false))).subscribe(data => {
      if (data.users) this.users.set(data.users);
      if (data.products) this.products.set(data.products);
      if (data.orders) this.orders.set(data.orders);
    });
  }

  navigate(section: Section): void {
    this.section.set(section);
    this.search.set('');
  }

  openNewProduct(): void { this.editingProductId.set(null); this.productForm = this.emptyProduct(); this.showProductForm.set(true); }
  editProduct(product: Product): void {
    this.editingProductId.set(product.id);
    this.productForm = { name: product.name, description: product.description ?? '', price: product.price, stock: product.stock };
    this.showProductForm.set(true);
  }
  saveProduct(): void {
    if (this.savingProduct()) return;
    const payload = { ...this.productForm, price: Number(this.productForm.price), stock: Number(this.productForm.stock) };
    const id = this.editingProductId();
    const request = id === null ? this.api.createProduct(payload) : this.api.updateProduct(id, payload);
    this.savingProduct.set(true);
    request.pipe(finalize(() => this.savingProduct.set(false))).subscribe({
      next: () => { this.showProductForm.set(false); this.notify(id === null ? 'Product created successfully' : 'Product updated successfully'); this.reloadProducts(); },
      error: e => this.reportError('Saving product', e)
    });
  }
  removeProduct(product: Product): void {
    if (!confirm(`Delete "${product.name}"?`)) return;
    this.api.deleteProduct(product.id).subscribe({
      next: () => { this.notify('Product deleted'); this.reloadProducts(); },
      error: e => this.reportError('Deleting product', e)
    });
  }

  openNewCustomer(): void { this.editingUserId.set(null); this.customerForm = { name: '', email: '' }; this.showCustomerForm.set(true); }
  editCustomer(user: User): void { this.editingUserId.set(user.id); this.customerForm = { name: user.name, email: user.email }; this.showCustomerForm.set(true); }
  saveCustomer(): void {
    if (this.savingCustomer()) return;
    const id = this.editingUserId();
    const request = id === null ? this.api.createUser(this.customerForm) : this.api.updateUser(id, this.customerForm);
    this.savingCustomer.set(true);
    request.pipe(finalize(() => this.savingCustomer.set(false))).subscribe({
      next: () => { this.showCustomerForm.set(false); this.notify(id === null ? 'Customer created successfully' : 'Customer updated successfully'); this.reloadUsers(); },
      error: e => this.reportError('Saving customer', e)
    });
  }
  removeCustomer(user: User): void {
    if (!confirm(`Delete customer "${user.name}"?`)) return;
    this.api.deleteUser(user.id).subscribe({
      next: () => { this.notify('Customer deleted'); this.reloadUsers(); },
      error: e => this.reportError('Deleting customer', e)
    });
  }

  openNewOrder(): void {
    if (!this.users().length || !this.products().length) {
      this.notify('Add at least one customer and one product before creating an order', 'info');
      return;
    }
    this.orderForm = { userId: this.users()[0].id, productId: this.products()[0].id, quantity: 1 };
    this.showOrderForm.set(true);
  }
  saveOrder(): void {
    if (this.savingOrder()) return;
    const payload = { userId: Number(this.orderForm.userId), productId: Number(this.orderForm.productId), quantity: Number(this.orderForm.quantity) };
    this.savingOrder.set(true);
    this.api.createOrder(payload).pipe(finalize(() => this.savingOrder.set(false))).subscribe({
      next: () => { this.showOrderForm.set(false); this.notify('Order created successfully'); this.reloadOrders(); },
      error: e => this.reportError('Creating order', e)
    });
  }
  changeStatus(order: Order, status: OrderStatus): void {
    if (this.updatingOrderIds().has(order.id)) return;
    this.updatingOrderIds.update(ids => new Set(ids).add(order.id));
    this.api.updateOrderStatus(order.id, { status }).pipe(finalize(() => this.updatingOrderIds.update(ids => {
      const next = new Set(ids);
      next.delete(order.id);
      return next;
    }))).subscribe({
      next: updated => { this.orders.update(items => items.map(item => item.id === updated.id ? updated : item)); this.notify(`Order #${order.id} status updated`); },
      error: e => this.reportError('Updating order status', e)
    });
  }
  removeOrder(order: Order): void {
    if (!confirm(`Delete order #${order.id}?`)) return;
    this.api.deleteOrder(order.id).subscribe({
      next: () => { this.notify('Order deleted'); this.reloadOrders(); },
      error: e => this.reportError('Deleting order', e)
    });
  }

  customerName(id: number): string { return this.users().find(u => u.id === id)?.name ?? `Customer #${id}`; }
  productName(id: number): string { return this.products().find(p => p.id === id)?.name ?? `Product #${id}`; }
  productPrice(id: number): number { return this.products().find(p => p.id === id)?.price ?? 0; }
  statusClass(status: string): string { return status.toLowerCase(); }
  formatMoney(value: number): string { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value); }

  private reloadProducts(): void { this.api.getProducts().subscribe({ next: x => this.products.set(x), error: e => this.reportError('Products', e) }); }
  private reloadUsers(): void { this.api.getUsers().subscribe({ next: x => this.users.set(x), error: e => this.reportError('Customers', e) }); }
  private reloadOrders(): void { this.api.getOrders().subscribe({ next: x => this.orders.set(x), error: e => this.reportError('Orders', e) }); }
  private emptyProduct(): ProductRequest { return { name: '', description: '', price: 0, stock: 0 }; }
  private notify(message: string, type: ToastType = 'success'): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toast.set({ message, type });
    this.toastTimeout = setTimeout(() => {
      this.toast.set(null);
      this.toastTimeout = undefined;
    }, 3500);
  }
  private reportError(area: string, error: unknown): void {
    const message = error instanceof HttpErrorResponse
      ? error.status === 0
        ? 'Cannot reach the API Gateway. Start all Spring Boot services and the gateway.'
        : typeof error.error === 'string'
          ? error.error
          : typeof error.error?.message === 'string'
            ? error.error.message
            : error.message
      : 'An unexpected error occurred.';
    this.notify(`${area}: ${message}`, 'error');
  }
}
