import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DemandeService } from '../../services/demande.service';
import { Demande } from '../../models/demande.model';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-formulaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgxIntlTelInputModule],
  templateUrl: './formulaire.component.html',
  styleUrl: './formulaire.component.scss'
})
export class FormulaireComponent {
  demandeForm: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  successMessage = '';

  // Configuration pour ngx-intl-tel-input
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.France,
    CountryISO.Belgium,
    CountryISO.Switzerland,
    CountryISO.Morocco,
    CountryISO.Algeria,
    CountryISO.Tunisia
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private demandeService: DemandeService
  ) {
    this.demandeForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]],
      adresseCabinet: ['', Validators.required],
      numVeterinaire: ['', Validators.required]

    });
  }

  get f() { return this.demandeForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.successMessage = '';

    if (this.demandeForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Préparation des données pour l'API selon le format requis
    const telephoneValue = this.demandeForm.value.telephone;
    let telephone = '';
    
    // Vérifier si la valeur du téléphone est un objet (cas de ngx-intl-tel-input)
    if (telephoneValue && typeof telephoneValue === 'object') {
      // Utiliser le numéro international sans le +
      telephone = telephoneValue.internationalNumber.replace(/\s/g, '').replace(/\+/g, '');
    } else {
      telephone = telephoneValue;
    }
    
    const demande: Demande = {
      nom: this.demandeForm.value.nom,
      prenom: this.demandeForm.value.prenom,
      email: this.demandeForm.value.email,
      telephone: telephone,
      adresseCabinet: this.demandeForm.value.adresseCabinet,
      numVeterinaire: this.demandeForm.value.numVeterinaire
    };

    this.demandeService.envoyerDemande(demande).subscribe({
      next: (response) => {
        this.loading = false;
        // Vérifier si la réponse contient un message d'erreur malgré le code 200
        if (response && response.error) {
          this.error = response.error;
          return;
        }
        
        this.successMessage = response.message || 'Demande soumise avec succès. Vous serez contacté pour finaliser votre inscription.';
        
        // Stockage des données dans le localStorage pour la page de confirmation
        localStorage.setItem('demande', JSON.stringify(demande));
        
        // Redirection après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/confirmation']);
        }, 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        if (error.status === 200) {
          // Si le statut est 200 mais qu'il y a une erreur, c'est probablement une réponse mal formée
          this.successMessage = 'Demande soumise avec succès. Vous serez contacté pour finaliser votre inscription.';
          
          // Stockage des données dans le localStorage pour la page de confirmation
          localStorage.setItem('demande', JSON.stringify(demande));
          
          // Redirection après 2 secondes
          setTimeout(() => {
            this.router.navigate(['/confirmation']);
          }, 2000);
        } else {
          this.error = error.error?.message || "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.";
        }
      }
    });
  }
} 