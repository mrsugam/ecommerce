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
        Promise.all(
          data.map((p: any) =>
            fetch(`http://localhost:8080/api/product/${p.id}/image`)
              .then(res => res.blob())
              .then(blob => ({
                ...p,
                imageUrl: URL.createObjectURL(blob)
              }))
              .catch(() => ({
                ...p,
                imageUrl: 'https://via.placeholder.com/200'
              }))
          )
        ).then(updated => {
          this.products = updated;
          this.isLoading = false;
        });
      },
      error: () => {
        this.isError = true;
        this.isLoading = false;
      }
    });
  }

  addToCart(product: any) {
    this.service.addToCart(product);
    this.toastr.success(
    `${product.name} added to cart 🛒`,
    'Success',
    {
      timeOut: 2000,
      positionClass: 'toast-top-right'
    }
  );
  }
}