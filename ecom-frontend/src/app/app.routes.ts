import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'add_product', loadComponent: () => import('./add-product/add-product.component').then(m => m.AddProductComponent) },
  { path: 'cart', loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent) },
  { path: 'product/:id', loadComponent: () => import('./product/product.component').then(m => m.ProductComponent) },
  { path: 'product/update/:id', loadComponent: () => import('./update-product/update-product.component').then(m => m.UpdateProductComponent) },
  { path: 'orders', loadComponent: () => import('./order/order.component').then(m => m.OrderComponent) }
];