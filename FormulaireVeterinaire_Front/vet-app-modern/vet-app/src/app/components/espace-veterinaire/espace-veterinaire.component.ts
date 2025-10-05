import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  selector: 'app-espace-veterinaire',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './espace-veterinaire.component.html',
  styleUrls: ['./espace-veterinaire.component.scss']
})
export class EspaceVeterinaireComponent {
  @ViewChild('demoVideo') demoVideo!: ElementRef<HTMLVideoElement>;
  
  showDemoModal = false;
  demoVideoPath = 'assets/videos/vitalfeed-demo.mp4';

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
  
  // Cart properties
  cartItems: CartItem[] = [];
  cartCount = 0;
  cartTotal = 0;

  features = [
    {
      icon: '🩺',
      title: 'Gestion des Dossiers Médicaux',
      description: 'Créez et gérez facilement les dossiers médicaux de vos patients à quatre pattes avec un système intuitif et sécurisé.'
    },
    {
      icon: '📅',
      title: 'Planification des Rendez-vous',
      description: 'Organisez votre emploi du temps et envoyez des rappels automatiques aux propriétaires d\'animaux.'
    },
    {
      icon: '💊',
      title: 'Suivi des Traitements',
      description: 'Suivez les traitements prescrits et recevez des alertes pour les rappels de vaccination et de médication.'
    },
    {
      icon: '📊',
      title: 'Statistiques et Analyses',
      description: 'Analysez vos données de pratique avec des tableaux de bord détaillés et des rapports personnalisés.'
    },
    {
      icon: '🔒',
      title: 'Sécurité des Données',
      description: 'Vos données et celles de vos patients sont protégées par un cryptage de niveau hospitalier.'
    },
    {
      icon: '🚀',
      title: 'Interface Moderne',
      description: 'Une interface utilisateur intuitive et moderne conçue spécialement pour les professionnels vétérinaires.'
    }
  ];

  testimonials = [
    {
      name: 'Dr. Sophie Martin',
      role: 'Vétérinaire à Paris',
      content: 'Cette application a révolutionné ma pratique quotidienne. Je gagne un temps précieux sur les tâches administratives.',
      avatar: '👩‍⚕️',
      rating: 5
    },
    {
      name: 'Dr. Thomas Dubois',
      role: 'Clinique vétérinaire de Lyon',
      content: 'L\'interface est intuitive et mes assistants adorent la facilité d\'utilisation. Hautement recommandé !',
      avatar: '👨‍⚕️',
      rating: 5
    },
    {
      name: 'Dr. Marie Leclerc',
      role: 'Vétérinaire spécialisée',
      content: 'Le suivi des traitements et la gestion des rappels sont exceptionnels. Mes clients apprécient le service.',
      avatar: '👩‍⚕️',
      rating: 5
    }
  ];

  plans = [
    {
      name: 'Essentiel',
      price: '29',
      period: 'mois',
      description: 'Parfait pour les petites cliniques',
      features: [
        'Jusqu\'à 100 patients',
        'Gestion de base des dossiers',
        'Planification des RDV',
        'Support email'
      ],
      recommended: false
    },
    {
      name: 'Professionnel',
      price: '59',
      period: 'mois',
      description: 'Idéal pour la plupart des vétérinaires',
      features: [
        'Patients illimités',
        'Toutes les fonctionnalités',
        'Statistiques avancées',
        'Support prioritaire',
        'Intégrations tierces'
      ],
      recommended: true
    },
    {
      name: 'Clinique',
      price: '99',
      period: 'mois',
      description: 'Pour les grandes structures',
      features: [
        'Multi-vétérinaires',
        'Gestion d\'équipe',
        'Rapports personnalisés',
        'Formation incluse',
        'Support téléphonique'
      ],
      recommended: false
    }
  ];

  constructor(private cartService: CartService) {
    this.products = this.getFeaturedProducts();
  }

  ngOnInit() {
    // Subscribe to cart updates
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartCount = items.reduce((count, item) => count + item.quantity, 0);
      this.cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    });
    
    // Start auto slide
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

  viewProductDetails(product: Product) {
    // Logique pour voir les détails du produit
    console.log('Voir détails du produit:', product);
  }

  // Refresh featured products (for potential future use)
  refreshFeaturedProducts(): void {
    this.products = this.getFeaturedProducts();
  }

  // Carousel methods
  startAutoSlide(): void {
    // Clear any existing interval
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    
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

  scrollToPricing(): void {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  openDemoVideo(): void {
    this.showDemoModal = true;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeDemoVideo(): void {
    this.showDemoModal = false;
    // Re-enable body scroll
    document.body.style.overflow = 'auto';
    
    // Pause video if it's playing
    if (this.demoVideo?.nativeElement) {
      this.demoVideo.nativeElement.pause();
      this.demoVideo.nativeElement.currentTime = 0;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.showDemoModal) {
      this.closeDemoVideo();
    }
  }
}