import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginUserData: User = { password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.process();
  }

  login(): void {
    this.authService.login(this.loginUserData).subscribe(() => {
      this.process();
    });
  }

  process() {
    if (this.authService.loggedIn) {
      this.router.navigate([this.authService.redirectUrl]);
    } else {
      this.loginUserData = { password: '' };
      this.router.navigate(['/login']);
    }
  }
}

export interface User {
  password: string;
}
