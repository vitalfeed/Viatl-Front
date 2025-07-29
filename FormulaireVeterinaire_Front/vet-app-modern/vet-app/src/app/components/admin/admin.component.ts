import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Demande {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresseCabinet: string;
  numVeterinaire: string;
}

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  numVeterinaire: string;
  demandeAccesId: number;
  firstLogin: boolean;
  admin: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  demandes: Demande[] = [];
  utilisateurs: Utilisateur[] = [];
  utilisateursDemandeIds: Set<number> = new Set();
  loading = true;
  error = '';

  // Pagination
  page = 1;
  pageSize = 7;
  get totalPages(): number {
    return Math.ceil(this.demandes.length / this.pageSize);
  }
  get paginatedDemandes(): Demande[] {
    const start = (this.page - 1) * this.pageSize;
    return this.demandes.slice(start, start + this.pageSize);
  }

  // Modal création utilisateur
  showModal = false;
  selectedDemande: Demande | null = null;
  selectedSubscription: 'SIX_MONTHS' | 'ONE_YEAR' | '' = '';
  validationText = '';
  creating = false;
  notification = '';

  // Modal abonnement
  showSubscriptionModal = false;
  subscriptionInfo: { type?: string; status?: string; startDate?: string; endDate?: string } | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    // Charger les utilisateurs puis les demandes
    this.http.get<Utilisateur[]>('http://localhost:8061/api/users/all', { headers }).subscribe({
      next: (users) => {
        this.utilisateurs = users;
        this.utilisateursDemandeIds = new Set(users.map(u => u.demandeAccesId));
        // Ensuite charger les demandes
        this.http.get<Demande[]>('http://localhost:8061/api/demandes/all', { headers }).subscribe({
          next: (data) => {
            this.demandes = data;
            this.loading = false;
          },
          error: (err) => {
            this.error = err.error?.message || 'Erreur lors du chargement des demandes.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des utilisateurs.';
        this.loading = false;
      }
    });
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
    }
  }

  openCreateModal(demande: Demande) {
    this.selectedDemande = demande;
    this.selectedSubscription = '';
    this.validationText = '';
    this.showModal = true;
    this.notification = '';
  }

  closeModal() {
    this.showModal = false;
    this.selectedDemande = null;
    this.selectedSubscription = '';
    this.validationText = '';
    this.creating = false;
    this.notification = '';
  }

  canCreate(): boolean {
    return this.selectedSubscription !== '' && this.validationText.trim().toLowerCase() === 'valider le compte';
  }

  createUserFromDemande() {
    if (!this.selectedDemande || !this.canCreate()) return;
    this.creating = true;
    const token = localStorage.getItem('admin_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const demandeId = (this.selectedDemande as any).id;
    this.http.post(
      `http://localhost:8061/api/users/create-from-demande/${demandeId}?subscriptionType=${this.selectedSubscription}`,
      {},
      { headers, observe: 'response', responseType: 'text' }
    ).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.notification = 'Le compte a été créé avec succès. Un e-mail a été envoyé au vétérinaire avec ses informations de connexion.';
          setTimeout(() => {
            this.notification = '';
          }, 12000);
        } else {
          this.notification = 'Le compte a été créé, mais la réponse du serveur est inattendue.';
        }
        this.creating = false;
        setTimeout(() => {
          this.closeModal();
          this.ngOnInit(); // refresh demandes
        }, 2000);
      },
      error: (err) => {
        // Afficher l'erreur uniquement si le code n'est pas 200
        this.notification = err.error?.message || 'Erreur lors de la création du compte.';
        this.creating = false;
      }
    });
  }

  openSubscriptionModal(demande: Demande) {
    // Préparer la structure, tu brancheras l'API plus tard
    this.selectedDemande = demande;
    this.subscriptionInfo = {
      type: '',
      status: '',
      startDate: '',
      endDate: ''
    };
    this.showSubscriptionModal = true;
  }

  closeSubscriptionModal() {
    this.showSubscriptionModal = false;
    this.selectedDemande = null;
    this.subscriptionInfo = null;
  }

  logout() {
    localStorage.clear();
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) caches.delete(name);
      });
    }
    this.router.navigate(['/']);
  }

  // Helper pour savoir si un compte existe déjà pour une demande
  hasUserForDemande(demandeId: number): boolean {
    return this.utilisateursDemandeIds.has(demandeId);
  }
} 