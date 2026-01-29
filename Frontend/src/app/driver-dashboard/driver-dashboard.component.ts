import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-dashboard.component.html',
})
export class DriverDashboardComponent implements OnInit {
  currentUser: any = null;
  assignedVehicle: any = null;
  loading = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const userString = localStorage.getItem('currentUser');

    if (!userString) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = JSON.parse(userString);


    this.fetchVehicle();
  }

  fetchVehicle() {

    this.http.get(`http://localhost:8080/api/vehicles/my-vehicle/${this.currentUser.id}`)
      .subscribe({
        next: (data) => {
          this.assignedVehicle = data;
          this.loading = false;
        },
        error: (err) => {
          console.error("Eroare la incarcarea masinii", err);
          this.loading = false;
        }
      });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
