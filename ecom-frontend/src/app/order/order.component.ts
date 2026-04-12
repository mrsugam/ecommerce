import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from '../service/app.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  orders: any[] = [];
  expandedOrderId: number | null = null;

  constructor(private service: AppService) {}

  ngOnInit(): void {
  this.service.orders$.subscribe(data => {
    this.orders = data;
  });

  this.service.getOrders().subscribe(); // 🔥 IMPORTANT
}

  toggleDetails(orderId: number) {
  this.expandedOrderId =
    this.expandedOrderId === orderId ? null : orderId;
}

  loadOrders() {
    this.service.getOrders().subscribe(res => {
      this.orders = res;
    });
  }

  deleteOrder(id: number) {
    this.service.deleteOrder(id).subscribe(() => {
      this.loadOrders();
    });
  }
}
