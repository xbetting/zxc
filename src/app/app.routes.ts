import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { AzuroBetsComponent } from './azuro-bets/azuro-bets.component';
import { BxbtComponent } from './bxbt/bxbt.component';
import { LoginComponent } from './login/login.component';
import { XBetsComponent } from './x-bets/x-bets.component';

export const routes: Routes = [
    { path: '' , redirectTo:'/login', pathMatch:'full' },
    { path: 'login' , component: LoginComponent },
    { path: 'azuro-bets', component: AzuroBetsComponent, canActivate: [authGuard] },
    { path: 'bxbt', component: BxbtComponent, canActivate: [authGuard] },
    { path: 'x-bets', component: XBetsComponent, canActivate: [authGuard] }
];
