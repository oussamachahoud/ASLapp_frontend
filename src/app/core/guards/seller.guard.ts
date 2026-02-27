import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SellerGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.hasAnyRole('ROLE_SELLER', 'ROLE_ADMIN')) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
