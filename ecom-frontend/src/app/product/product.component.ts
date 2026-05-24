import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../service/app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  product: any;

  constructor(
    private route: ActivatedRoute,
    private service: AppService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.service.getProductById(id!).subscribe({
      next: (data) => {
        this.product = data;
      },
      error: (err) => console.error(err)
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

  updateProduct() {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/product/update', id]);
  }
  deleteProduct() {
  const id = this.route.snapshot.paramMap.get('id');

  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  this.service.deleteProduct(id!).subscribe({
    next: () => {
      this.router.navigate(['/']); // go back to home
    },
    error: (err) => {
      console.error(err);
      this.toastr.error('Delete failed', 'Error', {
        timeOut: 2000,
        positionClass: 'toast-top-right'
      });
    }
  });
}
}
