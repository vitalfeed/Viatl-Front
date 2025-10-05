import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  subCategory: string;
  description: string;
  inStock: boolean;
}

@Component({
  selector: 'app-produits-veterinaire',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './produits-veterinaire.component.html',
  styleUrls: ['./produits-veterinaire.component.scss']
})
export class ProduitsVeterinaireComponent implements OnInit {
  // All available products
  allProducts: Product[] = [
    {
      id: 1,
      name: 'Croquettes Premium Chien Adulte',
      price: 45.99,
      image: '/assets/images/croquettes-chien.jpg',
      category: 'Chien',
      subCategory: 'Aliment',
      description: 'Croquettes haute qualité pour chien adulte',
      inStock: true
    },
    {
      id: 2,
      name: 'Complément Vitaminé Chat',
      price: 29.99,
      image: '/assets/images/vitamines-chat.jpg',
      category: 'Chat',
      subCategory: 'Complément',
      description: 'Vitamines essentielles pour chat',
      inStock: true
    },
    {
      id: 3,
      name: 'Test Rapide FIV/FeLV',
      price: 35.50,
      image: '/assets/images/test-fiv.jpg',
      category: 'Chat',
      subCategory: 'Test rapide',
      description: 'Test de dépistage rapide',
      inStock: false
    },
    {
      id: 4,
      name: 'Pâtée Premium Chien Senior',
      price: 38.99,
      image: '/assets/images/patee-chien.jpg',
      category: 'Chien',
      subCategory: 'Aliment',
      description: 'Alimentation adaptée aux chiens âgés',
      inStock: true
    },
    {
      id: 5,
      name: 'Probiotiques Chat Digestif',
      price: 42.00,
      image: '/assets/images/probiotiques.jpg',
      category: 'Chat',
      subCategory: 'Complément',
      description: 'Soutien de la flore intestinale',
      inStock: true
    },
    {
      id: 6,
      name: 'Vitamines Chien Actif',
      price: 33.90,
      image: '/assets/images/vitamines-chien.jpg',
      category: 'Chien',
      subCategory: 'Complément',
      description: 'Complément vitaminé pour chiens sportifs',
      inStock: true
    },
    {
      id: 7,
      name: 'Test Rapide Parvo Chien',
      price: 28.50,
      image: '/assets/images/test-parvo.jpg',
      category: 'Chien',
      subCategory: 'Test rapide',
      description: 'Test de dépistage du parvovirus',
      inStock: true
    },
    {
      id: 8,
      name: 'Croquettes Premium Chat Stérilisé',
      price: 42.90,
      image: '/assets/images/croquettes-chat.jpg',
      category: 'Chat',
      subCategory: 'Aliment',
      description: 'Alimentation spécialisée pour chats stérilisés',
      inStock: true
    }
  ];

  categories = [
    { name: 'Chien', icon: '🐶', color: '#3B82F6' },
    { name: 'Chat', icon: '🐱', color: '#EF4444' }
  ];
  
  sousCategories = [
    { name: 'Aliment', icon: '🍖', description: 'Nourriture et friandises' },
    { name: 'Complément', icon: '💊', description: 'Suppléments nutritionnels' },
    { name: 'Test rapide', icon: '🧪', description: 'Tests de diagnostic' }
  ];

  selectedCategory: string | null = null;
  selectedSousCategory: string | null = null;
  menuOpen = false;
  cartOpen = false;
  showAllProducts = false;
  cartItems: CartItem[] = [];
  cartCount = 0;
  cartTotal = 0;
  currentPage = 1;
  itemsPerPage = 9;
  Math = Math; // Make Math available in template

  constructor(
    private cartService: CartService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Subscribe to cart updates
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartCount = items.reduce((count, item) => count + item.quantity, 0);
      this.cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    });
    
    // Subscribe to query params changes
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['animal'] || null;
      this.selectedSousCategory = params['type'] || null;
      // Reset to first page when filters change
      this.currentPage = 1;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleCart() {
    this.cartOpen = !this.cartOpen;
  }

  toggleShowAllProducts() {
    this.showAllProducts = !this.showAllProducts;
    this.menuOpen = false;
  }

  selectCategory(cat: string) {
    this.selectedCategory = this.selectedCategory === cat ? null : cat;
    this.selectedSousCategory = null;
  }

  selectSousCategory(sub: string) {
    this.selectedSousCategory = sub;
    this.showAllProducts = true;
    this.menuOpen = false;
  }

  getFilteredProducts(): Product[] {
    console.log('Filtering with:', {
      selectedCategory: this.selectedCategory,
      selectedSousCategory: this.selectedSousCategory
    });
    
    // If no filters are applied, return all products
    if (!this.selectedCategory && !this.selectedSousCategory) {
      return this.allProducts;
    }
    
    return this.allProducts.filter(product => {
      // Normalize strings for comparison (lowercase, remove accents)
      const normalizeString = (str: string) => {
        return str.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      };
      
      const productCategory = normalizeString(product.category);
      const productSubCategory = normalizeString(product.subCategory);
      const filterCategory = this.selectedCategory ? normalizeString(this.selectedCategory) : null;
      const filterSubCategory = this.selectedSousCategory ? normalizeString(this.selectedSousCategory) : null;
      
      // If only product type is selected (no specific animal), match any animal with that type
      if (!filterCategory && filterSubCategory) {
        return productSubCategory === filterSubCategory;
      }
      
      // If only animal is selected (no specific type), match that animal with any type
      if (filterCategory && !filterSubCategory) {
        return productCategory === filterCategory;
      }
      
      // If both are selected, match both
      if (filterCategory && filterSubCategory) {
        return productCategory === filterCategory && productSubCategory === filterSubCategory;
      }
      
      return true;
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    console.log('Produit ajouté au panier:', product.name);
  }

  viewProductDetails(product: Product) {
    // Logique pour voir les détails du produit
    console.log('Voir détails du produit:', product);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackByCartItemId(index: number, item: CartItem): number {
    return item.id;
  }

  getPaginatedProducts(): Product[] {
    const filtered = this.getFilteredProducts();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    const filtered = this.getFilteredProducts();
    return Math.ceil(filtered.length / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    return Array.from({length: this.getTotalPages()}, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      // Scroll to top of products
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  navigateToVetSpace(): void {
    this.router.navigate(['/espace-veterinaire']);
  }

  goToCart(): void {
    // For now, we'll just log this action
    console.log('Navigate to cart');
  }

  checkout(): void {
    // For now, we'll just log this action
    console.log('Proceed to checkout');
  }
}