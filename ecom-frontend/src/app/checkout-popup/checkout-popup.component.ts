import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-popup.component.html',
  styleUrls: ['./checkout-popup.component.scss'] 
})
export class CheckoutPopupComponent {

  @Input() show = false;
  @Input() cartItems: any[] = [];
  @Input() totalPrice = 0;

  @Output() close = new EventEmitter();
  @Output() confirm = new EventEmitter();
  customerName = '';
  customerEmail = '';
  closePopup() {
  this.close.emit();
}

confirmOrder() {

  if (!this.customerName || !this.customerEmail) {
    alert('Please enter name and email');
    return;
  }

  this.confirm.emit({
    customer: this.customerName,
    email: this.customerEmail
  });
}

}