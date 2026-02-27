import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SignupRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  formData = signal<SignupRequest>({
    username: '',
    email: '',
    password: '',
    age: 0,
    reason: ''
  });

  successMessage = signal<string | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    this.error.set(null);
    this.successMessage.set(null);

    try {
      this.isLoading.set(true);
      await this.authService.signup(this.formData());
      this.successMessage.set('Signup successful! Please check your email to verify your account.');

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      let message = 'Signup failed. Please try again.';
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

  updateForm(field: keyof SignupRequest, value: any): void {
    const current = this.formData();
    this.formData.set({ ...current, [field]: value });
  }

  parseAge(value: string): number {
    return parseInt(value, 10) || 0;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement)?.value || '';
  }

  getTextAreaValue(event: Event): string {
    return (event.target as HTMLTextAreaElement)?.value || '';
  }
}
