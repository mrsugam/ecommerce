import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.scss']
})
export class UpdateProductComponent implements OnInit {

  product: any = {};
  image: any;

  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  // product data
  this.http.get(`http://localhost:8080/api/product/${id}`)
    .subscribe((data: any) => {
      this.product = data;
    });

  // 🔥 existing image
  this.http.get(`http://localhost:8080/api/product/${id}/image`, {
    responseType: 'blob'
  }).subscribe(blob => {
    this.previewUrl = URL.createObjectURL(blob);
  });
}

  onFileChange(event: any) {
  const file = event.target.files[0];

  if (!file) return;

  this.image = file;

  // 🔥 IMAGE PREVIEW
  const reader = new FileReader();
  reader.onload = () => {
    this.previewUrl = reader.result;
  };
  reader.readAsDataURL(file);
}

  update() {
    const formData = new FormData();

    formData.append(
      'product',
      new Blob([JSON.stringify(this.product)], { type: 'application/json' })
    );

    if (this.image) {
      formData.append('imageFile', this.image);
    }

    this.http.put(`http://localhost:8080/api/product/${this.product.id}`, formData)
      .subscribe({
        next: () => {
          alert('✅ Product updated');
          this.router.navigate(['/']);
        },
        error: (err) => console.error(err)
      });
  }
}