import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map, switchMap, tap } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AppService {

  private api = 'http://localhost:8080/api';

  private cartSubject = new BehaviorSubject<any[]>(
    JSON.parse(localStorage.getItem('cart') || '[]').map((item: any) => this.withProductImage(item))
  );
 

  private orderSubject = new BehaviorSubject<any[]>([]);
  orders$ = this.orderSubject.asObservable();
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/products`).pipe(
      map(products => products.map(product => this.withProductImage(product)))
    );
  }

  getProductById(id: string) {
  return this.http.get<any>(`${this.api}/product/${id}`).pipe(
    map(product => this.withProductImage(product))
  );
}

searchProducts(keyword: string) {
  return this.http.get<any[]>(`${this.api}/products/search?keyword=${keyword}`).pipe(
    map(products => products.map(product => this.withProductImage(product)))
  );
}

getProductImage(id: string) {
  return this.http.get(`${this.api}/product/${id}/image`, {
    responseType: 'blob'
  });
}

productImageUrl(id: string | number) {
  return `${this.api}/product/${id}/image`;
}

  addToCart(product: any) {
    const cart = this.cartSubject.value;
    const productWithImage = this.withProductImage(product);
    const existing = cart.find(p => p.id === productWithImage.id);
    const stockQuantity = this.getStockQuantity(productWithImage);
    const currentQuantity = existing?.quantity ?? 0;

    if (stockQuantity <= 0) {
      return {
        added: false,
        message: `${productWithImage.name} is out of stock`
      };
    }

    if (currentQuantity + 1 > stockQuantity) {
      return {
        added: false,
        message: `Only ${stockQuantity} ${productWithImage.name} available in stock`
      };
    }

    let updated;
    if (existing) {
      updated = cart.map(p =>
        p.id === productWithImage.id
          ? { ...this.withProductImage(p), quantity: p.quantity + 1 }
          : this.withProductImage(p)
      );
    } else {
      updated = [...cart.map(p => this.withProductImage(p)), { ...productWithImage, quantity: 1 }];
    }

    this.cartSubject.next(updated);
    localStorage.setItem('cart', JSON.stringify(updated));

    return {
      added: true,
      message: `${productWithImage.name} added to cart`
    };
  }

  removeFromCart(id: number) {
    const updated = this.cartSubject.value.filter(p => p.id !== id);
    this.cartSubject.next(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  updateCart(items: any[]) {
    const updated = items.map(item => this.withProductImage(item));
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
    switchMap(res =>
      this.getProducts().pipe(
        map(products => {
          const productsByName = new Map(
            products.map(product => [String(product.name).toLowerCase(), product])
          );

          return res.map(order => {
            const items = order.items?.map((item: any) => this.mapOrderItem(item, productsByName)) || [];

            return {
            orderId: order.orderId,
            customer: order.customerName,
            email: order.email,
            date: order.orderDate,
            status: order.status,
            items,
            itemsCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
            total: items.reduce(
              (sum: number, item: any) => sum + item.totalPrice, 0
            )
          };
        });
      })
    )
  ),
    tap(mapped => {
      this.orderSubject.next(mapped);
    })
  );
}

private mapOrderItem(item: any, productsByName = new Map<string, any>()) {
  const matchedProduct = productsByName.get(
    String(item.productName ?? item.name ?? '').toLowerCase()
  ) || {};
  const product = item.product || matchedProduct;
  const productId = item.productId ?? product.id;
  const quantity = Number(
    item.quantity ??
    item.qty ??
    item.productQuantity ??
    item.orderQuantity ??
    item.quantityOrdered ??
    0
  );
  const totalPrice = Number(item.totalPrice ?? 0);
  const price = Number(
    item.price ??
    item.unitPrice ??
    item.productPrice ??
    product.price ??
    (quantity > 0 ? totalPrice / quantity : 0) ??
    0
  );
  const itemTotal = totalPrice || price * quantity;

  return {
    ...item,
    productId,
    name: item.name ?? item.productName ?? product.name,
    brand: item.brand ?? product.brand,
    imageUrl: item.imageUrl ?? this.getProductImageUrl(product) ?? (productId ? this.productImageUrl(productId) : ''),
    quantity,
    price,
    totalPrice: itemTotal
  };
}

private withProductImage(product: any) {
  if (!product) {
    return product;
  }

  const productId = product.id ?? product.productId;
  const currentImageUrl = this.getProductImageUrl(product);

  return {
    ...product,
    imageUrl: currentImageUrl && !String(currentImageUrl).startsWith('blob:')
      ? currentImageUrl
      : productId ? this.productImageUrl(productId) : ''
  };
}

private getProductImageUrl(product: any) {
  if (!product) {
    return '';
  }

  if (product.imageData) {
    return `data:${product.imageType || 'image/jpeg'};base64,${product.imageData}`;
  }

  return product.imageUrl || '';
}

refreshCartImages() {
  return this.getProducts().pipe(
    tap(products => {
      const productsById = new Map(products.map(product => [product.id, product]));
      const updated = this.cartSubject.value.map(item => {
        const productId = item.id ?? item.productId;
        const product = productsById.get(productId);

        return product
          ? this.withProductImage({
              ...item,
              imageData: product.imageData,
              imageType: product.imageType,
              imageUrl: product.imageUrl
            })
          : this.withProductImage(item);
      });

      this.cartSubject.next(updated);
      localStorage.setItem('cart', JSON.stringify(updated));
    })
  );
}

getStockQuantity(product: any) {
  const stock = product?.stockQuantity ?? product?.stock ?? product?.quantityAvailable;
  return stock === undefined || stock === null ? Number.POSITIVE_INFINITY : Number(stock);
}

isInStock(product: any) {
  return this.getStockQuantity(product) > 0;
}

canAddToCart(product: any) {
  if (!this.isInStock(product)) {
    return false;
  }

  const productId = product?.id ?? product?.productId;
  const cartItem = this.cartSubject.value.find(item => item.id === productId || item.productId === productId);

  return (cartItem?.quantity ?? 0) < this.getStockQuantity(product);
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
