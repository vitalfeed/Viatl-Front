import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

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
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnDestroy {
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

  // Dynamic selection of featured products
  products: Product[] = [];
  
  // Carousel properties
  currentSlide = 0;
  autoSlideInterval: any;

  constructor(private cartService: CartService, private router: Router) {
    this.products = this.getFeaturedProducts();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  // Method to dynamically select diverse products for display
  getFeaturedProducts(): Product[] {
    const featured: Product[] = [];
    const categories = ['Chien', 'Chat'];
    const subCategories = ['Aliment', 'Complément', 'Test rapide'];
    
    // Try to get one product from each combination of category and subcategory
    for (const category of categories) {
      for (const subCategory of subCategories) {
        const productInCategory = this.allProducts.find(p => 
          p.category === category && 
          p.subCategory === subCategory && 
          !featured.includes(p)
        );
        
        if (productInCategory && featured.length < 6) {
          featured.push(productInCategory);
        }
      }
    }
    
    // If we don't have enough, add some random popular products
    if (featured.length < 6) {
      const remaining = this.allProducts.filter(p => !featured.includes(p) && p.inStock);
      while (featured.length < 6 && remaining.length > 0) {
        const randomIndex = Math.floor(Math.random() * remaining.length);
        featured.push(remaining.splice(randomIndex, 1)[0]);
      }
    }
    
    return featured;
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    console.log('Produit ajouté au panier:', product.name);
  }

  // Refresh featured products (for potential future use)
  refreshFeaturedProducts(): void {
    this.products = this.getFeaturedProducts();
  }

  // Carousel methods
  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000); // Auto slide every 4 seconds
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.products.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.products.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    // Restart auto slide when user manually changes slide
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.startAutoSlide();
    }
  }

  getSlideIndicators(): number[] {
    return Array.from({ length: this.products.length }, (_, i) => i);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackByIndex(index: number): number {
    return index;
  }

  navigateToVetSpace(): void {
    this.router.navigate(['/espace-veterinaire']);
  }
}