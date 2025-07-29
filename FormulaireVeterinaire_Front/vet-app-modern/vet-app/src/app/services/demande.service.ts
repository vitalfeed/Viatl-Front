import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Demande } from '../models/demande.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private apiUrl = `${environment.apiUrl}/demandes`;

  constructor(private http: HttpClient) { }

  envoyerDemande(demande: Demande): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.apiUrl, demande, { headers, observe: 'response' })
      .pipe(
        map(response => {
          // Si la réponse est un texte, on le transforme en objet avec un message
          if (typeof response.body === 'string') {
            return { message: response.body };
          }
          return response.body;
        }),
        catchError(error => {
          // Si l'erreur a un statut 200, c'est probablement une réponse mal formatée
          if (error.status === 200) {
            return of({ message: 'Demande soumise avec succès. Vous serez contacté pour finaliser votre inscription.' });
          }
          throw error;
        })
      );
  }
} 