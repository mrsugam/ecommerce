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

    this.service.refreshCartImages().subscribe();
  }

  increase(id: number) {
    const selectedItem = this.cartItems.find(item => item.id === id);

    if (selectedItem && !this.canIncrease(selectedItem)) {
      this.showStockWarning(selectedItem);
      return;
    }

    this.cartItems = this.cartItems.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    this.service.updateCart(this.cartItems);
    this.calculateTotal();
  }

  decrease(id: number) {
    this.cartItems = this.cartItems.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
        : item
    );
    this.service.updateCart(this.cartItems);
    this.calculateTotal();
  }

  remove(id: number) {
    this.service.removeFromCart(id);
  }

  calculateTotal() {
    this.totalPrice = this.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }

  openCheckout() {
    if (this.cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    const overStockItem = this.cartItems.find(item => item.quantity > this.getStockQuantity(item));
    if (overStockItem) {
      this.showStockWarning(overStockItem);
      return;
    }

    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  onConfirmOrder(data: any) {
    const overStockItem = this.cartItems.find(item => item.quantity > this.getStockQuantity(item));
    if (overStockItem) {
      this.showStockWarning(overStockItem);
      return;
    }

    const orderPayload = {
      customerName: data.customer,
      email: data.email,
      items: this.cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    this.service.createOrder(orderPayload).subscribe(res => {
      console.log('Order placed', res);

      this.service.clearCart();
      this.service.getOrders().subscribe();
      this.showPopup = false;
    });
  }

  getStockQuantity(item: any) {
    return this.service.getStockQuantity(item);
  }

  canIncrease(item: any) {
    return item.quantity < this.getStockQuantity(item);
  }

  private showStockWarning(item: any) {
    this.toastr.warning(
      `Only ${this.getStockQuantity(item)} ${item.name} available in stock`,
      'Stock limit',
      {
        timeOut: 2000,
        positionClass: 'toast-top-right'
      }
    );
  }
}
