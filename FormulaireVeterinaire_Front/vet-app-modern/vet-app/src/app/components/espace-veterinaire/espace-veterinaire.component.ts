import { Component, ViewChild, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-espace-veterinaire',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './espace-veterinaire.component.html',
  styleUrls: ['./espace-veterinaire.component.scss']
})
export class EspaceVeterinaireComponent implements OnInit, OnDestroy {
  @ViewChild('demoVideo') demoVideo!: ElementRef<HTMLVideoElement>;

  showDemoModal = false;
  demoVideoPath = 'assets/videos/vitalfeed-demo.mp4';

  // Profile dropdown
  showProfileDropdown = false;
  showPasswordModal = false;
  passwordForm: FormGroup;
  passwordLoading = false;
  passwordError = '';
  passwordSuccess = '';

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Password strength
  passwordStrength = 0;
  passwordStrengthText = '';
  passwordStrengthColor = '';

  // All available products
  allProducts: Product[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  productsLoaded: boolean = false;

  // Dynamic selection of featured products
  products: Product[] = [];
  displayProducts: Product[] = []; // Products with duplicates for infinite scroll

  // Carousel properties
  currentSlide = 0;
  autoSlideInterval: any;
  itemsPerSlide = 3; // Number of items to show per slide on desktop

  // Cart properties
  cartItems: CartItem[] = [];
  cartCount = 0;
  cartTotal = 0;

  // User status and info
  userStatus: string = '';
  userName: string = '';
  userFullName: string = '';

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

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private router: Router,
    private http: HttpClient,
    private formBuilder: FormBuilder
  ) {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Watch for password changes to update strength indicator
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.updatePasswordStrength(password);
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Custom validator for password strength
   * Requires: min 8 chars, 1 uppercase, 1 special character
   */
  passwordStrengthValidator(control: any) {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;

    const errors: any = {};
    if (!hasUpperCase) errors.noUpperCase = true;
    if (!hasSpecialChar) errors.noSpecialChar = true;
    if (!hasMinLength) errors.minLength = true;

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Update password strength indicator
   */
  updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      this.passwordStrengthColor = '';
      return;
    }

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Calculate strength
    if (checks.length) strength += 20;
    if (checks.uppercase) strength += 20;
    if (checks.lowercase) strength += 20;
    if (checks.number) strength += 20;
    if (checks.special) strength += 20;

    this.passwordStrength = strength;

    // Set text and color based on strength
    if (strength <= 40) {
      this.passwordStrengthText = 'Faible';
      this.passwordStrengthColor = '#ef4444'; // red
    } else if (strength <= 60) {
      this.passwordStrengthText = 'Moyen';
      this.passwordStrengthColor = '#f59e0b'; // orange
    } else if (strength <= 80) {
      this.passwordStrengthText = 'Bon';
      this.passwordStrengthColor = '#3b82f6'; // blue
    } else {
      this.passwordStrengthText = 'Excellent';
      this.passwordStrengthColor = '#10b981'; // green
    }
  }

  /**
   * Toggle password visibility
   */
  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  ngOnInit() {
    // Check if user is logged in
    this.checkAuthentication();

    // Load user data to get status
    this.loadUserData();

    // Don't load products immediately - they will be loaded when needed
    // this.loadProducts();

    // Subscribe to cart updates
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartCount = items.reduce((count, item) => count + item.quantity, 0);
      this.cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    });
  }

  /**
   * Check if user is authenticated
   */
  checkAuthentication(): void {
    const userToken = localStorage.getItem('user_token');
    if (!userToken) {
      // Redirect to login if not authenticated
      this.router.navigate(['/login']);
    }
  }

  /**
   * Load user data to get status
   */
  loadUserData(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/veterinaires/${userId}`).subscribe({
      next: (data) => {
        console.log('User data received:', data);
        this.userStatus = data.status || '';
        this.userName = data.nom || '';
        this.userFullName = `${data.prenom || ''} ${data.nom || ''}`.trim();
        console.log('User status set to:', this.userStatus);
        console.log('User full name:', this.userFullName);
        console.log('Should show CTA?', this.userStatus !== 'ACTIVE');
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      }
    });
  }

  /**
   * Toggle profile dropdown
   */
  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  /**
   * Close profile dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-container')) {
      this.showProfileDropdown = false;
    }
  }

  /**
   * Open password change modal
   */
  openPasswordModal(): void {
    this.showPasswordModal = true;
    this.showProfileDropdown = false;
    this.passwordForm.reset();
    this.passwordError = '';
    this.passwordSuccess = '';
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close password change modal
   */
  closePasswordModal(): void {
    this.showPasswordModal = false;
    document.body.style.overflow = 'auto';
    this.passwordForm.reset();
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  /**
   * Change password
   */
  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.passwordLoading = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    const userToken = localStorage.getItem('user_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    });

    const body = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.http.post(`${environment.apiUrl}/reset-password`, body, { headers, responseType: 'text' }).subscribe({
      next: (response) => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Mot de passe modifié avec succès !';

        // Close modal after 2 seconds
        setTimeout(() => {
          this.closePasswordModal();
        }, 2000);
      },
      error: (error) => {
        this.passwordLoading = false;
        console.error('Password change error:', error);

        // Try to get the error message from the API response
        let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';

        if (error.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.status === 400) {
          // Check if there's a specific error message from the API
          let apiError = '';
          if (error.error && typeof error.error === 'string') {
            apiError = error.error;
          } else if (error.error?.message) {
            apiError = error.error.message;
          }

          // Translate common API errors to French
          if (apiError.toLowerCase().includes('current password is incorrect') ||
            apiError.toLowerCase().includes('mot de passe actuel incorrect')) {
            errorMessage = 'Le mot de passe actuel est incorrect.';
          } else if (apiError) {
            errorMessage = apiError;
          } else {
            errorMessage = 'Le mot de passe ne respecte pas les critères requis.';
          }
        }

        this.passwordError = errorMessage;
      }
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear all tokens and user data
    localStorage.removeItem('user_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');

    // Redirect to home page
    this.router.navigate(['/']);
  }

  /**
   * Navigate to panier (cart) page
   */
  navigateToPanier(): void {
    this.router.navigate(['/panier']);
  }

  /**
   * Load products from API - only loads once when needed
   */
  loadProducts(): void {
    // Don't reload if already loaded
    if (this.productsLoaded) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.products = this.getFeaturedProducts();
        this.createDisplayProducts();
        this.isLoading = false;
        this.productsLoaded = true;
        this.startAutoSlide();
        console.log('Products loaded:', products.length);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Create display products by duplicating the array for infinite scroll effect
   */
  createDisplayProducts(): void {
    // Only duplicate if we have enough products to warrant infinite scrolling
    // If we have 3 or fewer products, just show them once
    if (this.products.length <= this.itemsPerSlide) {
      this.displayProducts = this.products;
    } else {
      // Duplicate products to create seamless loop
      this.displayProducts = [...this.products, ...this.products];
    }
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  // Method to dynamically select diverse products for display
  getFeaturedProducts(): Product[] {
    const featured: Product[] = [];
    const categories = ['CHIEN', 'CHAT'];
    const subCategories = ['ALIMENT', 'COMPLEMENT', 'TEST_RAPIDE'];

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

  /**
   * Get display label for category
   */
  getCategoryLabel(category: string): string {
    return this.productService.getCategoryLabel(category);
  }

  /**
   * Get display label for sub-category
   */
  getSubCategoryLabel(subCategory: string): string {
    return this.productService.getSubCategoryLabel(subCategory);
  }

  /**
   * Get emoji for category
   */
  getCategoryEmoji(category: string): string {
    return this.productService.getCategoryEmoji(category);
  }

  /**
   * Get emoji for sub-category
   */
  getSubCategoryEmoji(subCategory: string): string {
    return this.productService.getSubCategoryEmoji(subCategory);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    console.log('Produit ajouté au panier:', product.name);
  }

  viewProductDetails(product: Product) {
    // Logique pour voir les détails du produit
    console.log('Voir détails du produit:', product);
  }

  /**
   * Navigate to product in produits-veterinaire catalog
   */
  viewProductInCatalog(product: Product): void {
    // Navigate to produits-veterinaire page with product ID as query parameter
    this.router.navigate(['/produits-veterinaire'], {
      queryParams: { highlight: product.id }
    }).then(() => {
      // Scroll to top of page smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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

  getTotalSlides(): number {
    return Math.ceil(this.products.length / this.itemsPerSlide);
  }

  nextSlide(): void {
    // Only enable infinite scroll if we have more products than items per slide
    if (this.products.length <= this.itemsPerSlide) {
      // Simple carousel without infinite scroll
      const maxSlide = Math.max(0, this.products.length - this.itemsPerSlide);
      if (this.currentSlide < maxSlide) {
        this.currentSlide++;
      } else {
        this.currentSlide = 0; // Loop back to start
      }
    } else {
      // Infinite scroll carousel
      this.currentSlide++;

      // Reset to beginning when we've shown all original products
      if (this.currentSlide >= this.products.length) {
        // Use setTimeout to reset position after transition completes
        setTimeout(() => {
          this.currentSlide = 0;
        }, 500); // Match transition duration
      }
    }
  }

  prevSlide(): void {
    if (this.products.length <= this.itemsPerSlide) {
      // Simple carousel without infinite scroll
      const maxSlide = Math.max(0, this.products.length - this.itemsPerSlide);
      if (this.currentSlide > 0) {
        this.currentSlide--;
      } else {
        this.currentSlide = maxSlide; // Loop to end
      }
    } else {
      // Infinite scroll carousel
      if (this.currentSlide === 0) {
        // Jump to the end of the first set
        this.currentSlide = this.products.length - 1;
      } else {
        this.currentSlide--;
      }
    }
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
    return Array.from({ length: this.getTotalSlides() }, (_, i) => i);
  }

  getTransformValue(): string {
    // Calculate transform based on item width percentage
    const itemWidth = 100 / this.itemsPerSlide; // Each item takes this % of container
    return `translateX(-${this.currentSlide * itemWidth}%)`;
  }

  getCurrentIndicator(): number {
    return this.currentSlide % this.getTotalSlides();
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

  scrollToProducts(): void {
    // Load products when user wants to see them
    this.loadProducts();

    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({
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

  /**
   * Handle image load error
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/default-product.jpg';
    img.onerror = null; // Prevent infinite loop
  }
}