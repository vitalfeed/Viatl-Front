import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.scss']
})
export class PanierComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  continueShopping(): void {
    this.router.navigate(['/produits-veterinaire']);
  }

  proceedToCheckout(): void {
    console.log('Proceed to checkout');
    // Add checkout logic here
  }

  clearCart(): void {
    if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
      this.cartItems.forEach(item => this.cartService.removeFromCart(item.id));
    }
  }

  trackByCartItemId(index: number, item: CartItem): number {
    return item.id;
  }
}
