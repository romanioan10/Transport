import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',

})
export class LoginComponent {
  email = 'tata@transport.ro';
  password = 'parolaSecreta123';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    const loginData = {
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost:8080/api/users/login', loginData)
      .subscribe({
        next: (user) => {
          console.log('Login reusit!', user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          if (user.role === 'DRIVER') {
            this.router.navigate(['/driver-dashboard']);
          } else {
            alert("Login client reusit (Dashboard Client inca nu e gata)");
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Email sau parola gresita!';
        }
      });
  }
}
