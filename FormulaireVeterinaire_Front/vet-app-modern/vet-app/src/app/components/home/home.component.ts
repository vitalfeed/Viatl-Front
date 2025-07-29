import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  features = [
    {
      title: 'Gestion des dossiers médicaux',
      description: 'Créez et gérez facilement les dossiers médicaux de vos patients à quatre pattes.',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      title: 'Planification des rendez-vous',
      description: 'Organisez votre emploi du temps et envoyez des rappels automatiques aux propriétaires.',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      title: 'Suivi des traitements',
      description: 'Suivez les traitements prescrits et recevez des alertes pour les rappels de vaccination.',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      title: 'Facturation simplifiée',
      description: 'Générez des factures et suivez les paiements en quelques clics.',
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z'
    }
  ];

  testimonials = [
    {
      name: 'Dr. Sophie Martin',
      role: 'Vétérinaire à Paris',
      content: 'Cette application a révolutionné ma pratique quotidienne. Je gagne un temps précieux sur les tâches administratives.',
      avatar: 'assets/avatar-1.svg'
    },
    {
      name: 'Dr. Thomas Dubois',
      role: 'Clinique vétérinaire de Lyon',
      content: 'Mes assistants et moi sommes ravis de la simplicité d\'utilisation et de l\'efficacité de cette solution.',
      avatar: 'assets/avatar-2.svg'
    }
  ];
}
