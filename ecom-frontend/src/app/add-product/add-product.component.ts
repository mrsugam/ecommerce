import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'] 
})
export class AddProductComponent {

  product: any = {};
  image: any;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(private http: HttpClient) {}

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

  submit() {
  if (!this.image) {
    alert('Please select image');
    return;
  }

  const formData = new FormData();

  formData.append('imageFile', this.image);
  formData.append(
    'product',
    new Blob([JSON.stringify(this.product)], { type: 'application/json' })
  );

  this.http.post('http://localhost:8080/api/product', formData)
    .subscribe({
      next: () => {
        alert('✅ Product added');
        this.product = {};
      },
      error: (err) => {
        console.error(err);
        alert('❌ Error adding product');
      }
    });
}
}