import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.loggedIn) {
    return true
  }
  // Redirect to the login page
  //this.router.navigate(['/login']);
  return router.parseUrl('/login');
};
