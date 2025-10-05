import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ou-trouver-nos-produits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ou-trouver-nos-produits.component.html',
  styleUrls: ['./ou-trouver-nos-produits.component.scss']
})
export class OuTrouverNosProduitsComponent {
  isMapMaximized: boolean = false;

  constructor(private router: Router) {}

  navigateToVetSpace() {
    this.router.navigate(['/espace-veterinaire']);
  }

  navigateBack() {
    this.router.navigate(['/espace-proprietaire']);
  }

  maximizeMap() {
    this.isMapMaximized = true;
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  minimizeMap() {
    this.isMapMaximized = false;
    // Restore body scrolling
    document.body.style.overflow = 'auto';
  }
}
