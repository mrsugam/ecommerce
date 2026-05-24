import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AppService } from "../service/app.service";
import { debounceTime, Subject } from "rxjs";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  @Output() categoryChange = new EventEmitter<string>();
  
  searchSubject = new Subject<string>();

  theme = localStorage.getItem('theme') || 'light-theme';
  input = '';
  searchResults: any[] = [];
  showSearch = false;
  cartCount = 0;

  constructor(private service: AppService) {
    document.body.className = this.theme;
  }

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(300))
      .subscribe(value => {
        this.service.searchProducts(value).subscribe(res => {
          this.searchResults = res;
        });
      });

    this.service.cart$.subscribe(cart => {
      this.cartCount = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
    });
  }

search(value: string) {
  this.input = value;

  if (value.trim()) {
    this.showSearch = true;
    this.searchSubject.next(value);
  } else {
    this.showSearch = false;
  }
}

  toggleTheme() {
    this.theme = this.theme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    localStorage.setItem('theme', this.theme);
    document.body.className = this.theme;
  }

  

  selectCategory(category: string) {
    this.categoryChange.emit(category);
  }
}
