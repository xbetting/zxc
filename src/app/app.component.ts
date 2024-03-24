import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CacheService } from './cache.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    NgIf,
    MatSlideToggleModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'zxc-code';

  constructor(public _authService: AuthService, private router: Router, private cacheService: CacheService) {}

  ngOnInit() {
  }

  get isAdmin(){
    let is_admin = localStorage.getItem('is_admin');
    if(is_admin === 'on'){
      return true;
    }else{
      return false;
    }
  }

  resetCache(){
    this.cacheService.clearAll();
    this.router.navigate(['/']);
  }

  logoutUser(){
    this._authService.logout();
    this.router.navigate(['/login']);
    return true;
  }
}
