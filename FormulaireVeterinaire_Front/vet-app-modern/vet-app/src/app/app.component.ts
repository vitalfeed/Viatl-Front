import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'vet-app';

  get isAdmin(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  logout() {
    localStorage.clear();
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) caches.delete(name);
      });
    }
    window.location.href = '/';
  }
}
