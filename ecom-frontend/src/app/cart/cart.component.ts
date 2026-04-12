import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from '../service/app.service';
import { CheckoutPopupComponent } from '../checkout-popup/checkout-popup.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CheckoutPopupComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  cartItems: any[] = [];
  totalPrice = 0;
  showPopup = false;

  constructor(
    private service: AppService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.service.cart$.subscribe(cart => {
      this.cartItems = cart;
      this.calculateTotal();
    });
  }

  // ➕ Increase quantity
  increase(id: number) {
    this.cartItems = this.cartItems.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    this.calculateTotal();
  }

  // ➖ Decrease quantity
  decrease(id: number) {
    this.cartItems = this.cartItems.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
        : item
    );
    this.calculateTotal();
  }

  // ❌ Remove item
  remove(id: number) {
    this.service.removeFromCart(id);
  }

  // 💰 Total calculation
  calculateTotal() {
    this.totalPrice = this.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }

  // 🛒 Open popup
  openCheckout() {
    if (this.cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }
    this.showPopup = true;
  }

  // ❌ Close popup
  closePopup() {
    this.showPopup = false;
  }

  onConfirmOrder(data: any) {

  const orderPayload = {
    customerName: data.customer,   // match backend
    email: data.email,
    items: this.cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }))
  };

  this.service.createOrder(orderPayload).subscribe(res => {
    console.log('Order placed', res);

    this.service.clearCart();      // optional
    this.service.getOrders().subscribe(); // refresh orders
    this.showPopup = false;

  });
}
}