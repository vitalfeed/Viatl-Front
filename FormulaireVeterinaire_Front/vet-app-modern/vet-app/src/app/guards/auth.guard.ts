import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userToken = localStorage.getItem('user_token');

  if (userToken) {
    return true;
  } else {
    // Redirect to login page
    router.navigate(['/login']);
    return false;
  }
};
