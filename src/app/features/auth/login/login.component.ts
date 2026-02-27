import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials = signal<LoginRequest>({
    email: '',
    password: ''
  });

  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    this.error.set(null);

    try {
      this.isLoading.set(true);
      await this.authService.login(this.credentials());
      this.router.navigate(['/']);
    } catch (err: any) {
      const errorData = err.response?.data;
      let message = 'Login failed. Please try again.';
      if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData?.message) {
        message = errorData.message;
      } else if (typeof errorData === 'object' && errorData !== null) {
        message = Object.values(errorData).join('. ');
      }
      this.error.set(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  updateForm(field: keyof LoginRequest, value: any): void {
    const current = this.credentials();
    this.credentials.set({ ...current, [field]: value });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement)?.value || '';
  }
}
