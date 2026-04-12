import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AppService {

  private api = 'http://localhost:8080/api';

  private cartSubject = new BehaviorSubject<any[]>(
    JSON.parse(localStorage.getItem('cart') || '[]')
  );
 

  private orderSubject = new BehaviorSubject<any[]>([]);
  orders$ = this.orderSubject.asObservable();
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/products`);
  }

  getProductById(id: string) {
  return this.http.get<any>(`${this.api}/product/${id}`);
}

searchProducts(keyword: string) {
  return this.http.get<any[]>(`${this.api}/products/search?keyword=${keyword}`);
}

getProductImage(id: string) {
  return this.http.get(`${this.api}/product/${id}/image`, {
    responseType: 'blob'
  });
}

  addToCart(product: any) {
    const cart = this.cartSubject.value;
    const existing = cart.find(p => p.id === product.id);

    let updated;
    if (existing) {
      updated = cart.map(p =>
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      );
    } else {
      updated = [...cart, { ...product, quantity: 1 }];
    }

    this.cartSubject.next(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  removeFromCart(id: number) {
    const updated = this.cartSubject.value.filter(p => p.id !== id);
    this.cartSubject.next(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  clearCart() {
    this.cartSubject.next([]);
    localStorage.removeItem('cart');
  }

  deleteProduct(id: string) {
    return this.http.delete(`${this.api}/product/${id}`, {
      responseType: 'text'
    });
  }
  getOrders() {
  return this.http.get<any[]>(`${this.api}/orders`).pipe(
    tap(res => {
      const mapped = res.map(order => ({
        orderId: order.orderId,
        customer: order.customerName,
        email: order.email,
        date: order.orderDate,
        status: order.status,
        items: order.items,
        total: order.items?.reduce(
          (sum: number, i: any) => sum + Number(i.totalPrice), 0
        )
      }));

      this.orderSubject.next(mapped);
    })
  );
}

createOrder(order: any) {
  return this.http.post(`${this.api}/orders/place`, order);
}

deleteOrder(id: number) {
  return this.http.delete(`${this.api}/orders/${id}`);
}

addOrder(order: any) {
  const updated = [...this.orderSubject.value, order];
  this.orderSubject.next(updated);
  localStorage.setItem('orders', JSON.stringify(updated));
}
}