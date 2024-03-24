import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { AppConstants } from '../app.constants';
import { CacheService } from '../cache.service';
import { CryptoService } from '../crypto.service';
import { User } from '../login/login.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedIn = false;
  redirectUrl: string | null = null;

  constructor(private cryptoService: CryptoService, private cacheService: CacheService) { }

  login(user: User): Observable<boolean> {
    if (user && user.password) {
      const endpoint = this.cryptoService.decrypt(AppConstants.XBETS_ENDPOINT_X, user.password);
      if (endpoint && endpoint.startsWith('https')) {
        return of(true).pipe(
          delay(1000),
          tap(() => {
            this.redirectUrl = '/azuro-bets';
            this.loggedIn = true;
            localStorage.setItem('token', user.password);
          })
        );
      }
    }

    return of(false).pipe(
      delay(1000),
      tap(() => {
        this.redirectUrl = '/login';
        this.logout();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.clear();
    this.redirectUrl = null;
    this.loggedIn = false;
    this.cacheService.clearAll();
  }

}
