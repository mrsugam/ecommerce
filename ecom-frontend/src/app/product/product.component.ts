import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../service/app.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  product: any;
  imageUrl = '';

  constructor(
    private route: ActivatedRoute,
    private service: AppService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.service.getProductById(id!).subscribe({
      next: (data) => {
        this.product = data;
      },
      error: (err) => console.error(err)
    });

    // ✅ Get image
    this.service.getProductImage(id!).subscribe({
      next: (blob) => {
        this.imageUrl = URL.createObjectURL(blob);
      },
      error: (err) => console.error(err)
    });
  }

  addToCart(product: any) {
    this.service.addToCart(product);
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
      alert('❌ Delete failed');
    }
  });
}
}