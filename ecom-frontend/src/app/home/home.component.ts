import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppService } from '../service/app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  products: any[] = [];
  isError = false;
  isLoading = true;

  constructor(private service: AppService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.service.getProducts().subscribe({
      next: (data: any[]) => {
        this.products = data;
        this.isLoading = false;
      },
      error: () => {
        this.isError = true;
        this.isLoading = false;
      }
    });
  }

  addToCart(product: any) {
    const result = this.service.addToCart(product);
    const toastOptions = {
      timeOut: 2000,
      positionClass: 'toast-top-right'
    };

    if (!result.added) {
      this.toastr.warning(result.message, 'Stock limit', toastOptions);
      return;
    }

    this.toastr.success(result.message, 'Success', toastOptions);
  }

  canAddToCart(product: any) {
    return this.service.canAddToCart(product);
  }

  isInStock(product: any) {
    return this.service.isInStock(product);
  }
}
