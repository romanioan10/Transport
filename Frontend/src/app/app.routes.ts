import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {DriverDashboardComponent} from "./driver-dashboard/driver-dashboard.component";

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'driver-dashboard',
    component: DriverDashboardComponent,
  },
];
