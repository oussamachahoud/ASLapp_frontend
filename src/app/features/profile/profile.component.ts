import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User, Address, AddressRequest, UpdateUserRequest } from '../../core/models/auth.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  isEditingProfile = signal(false);
  isAddingAddress = signal(false);

  profileForm = signal<UpdateUserRequest>({});
  addressForm = signal<AddressRequest>({
    street: '',
    wilaya: '',
    commune: '',
    codePostal: ''
  });

  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  readonly wilayas = [
    'Alger', 'Blida', 'Boumerdès', 'Tipaza', 'Tizi Ouzou', 'Bejaia',
    'Sétif', 'Mila', 'Constantine', 'Annaba', 'Skikda', 'Jijel',
    'Oran', 'Mostaganem', 'Sidi Bel Abbès', 'Mascara', 'Saïda', 'Tiaret',
    'Tlemcen', 'Tébessa', 'Khenchela', 'Oum El Bouaghi', 'Batna',
    'Djanet', 'Tamanrasset', 'Béchar', 'Adrar', 'Ghardaïa', 'Laghouat',
    'El Oued', 'Ouargla', 'Hassi Messaoud', 'Touggourt'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.user();
    if (currentUser) {
      this.user.set(currentUser);
      this.profileForm.set({
        username: currentUser.username,
        email: currentUser.email,
        age: currentUser.age
      });
    }
  }

  toggleEditProfile(): void {
    this.isEditingProfile.set(!this.isEditingProfile());
    if (!this.isEditingProfile()) {
      this.error.set(null);
      this.successMessage.set(null);
    }
  }

  toggleAddAddress(): void {
    this.isAddingAddress.set(!this.isAddingAddress());
    if (!this.isAddingAddress()) {
      this.resetAddressForm();
      this.error.set(null);
    }
  }

  async updateProfile(): Promise<void> {
    this.error.set(null);
    this.successMessage.set(null);
    this.isLoading.set(true);

    try {
      await this.authService.updateProfile(this.profileForm());
      this.successMessage.set('Profile updated successfully!');
      this.toggleEditProfile();
      this.loadUserProfile();
    } catch (err: any) {
      this.error.set(err.response?.data?.message || 'Failed to update profile');
    } finally {
      this.isLoading.set(false);
    }
  }

  onImageSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage.set(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadImage(): Promise<void> {
    const file = this.selectedImage();
    if (!file) {
      this.error.set('Please select an image');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.authService.uploadProfileImage(file);
      this.successMessage.set('Profile image updated successfully!');
      this.selectedImage.set(null);
      this.imagePreview.set(null);
      this.loadUserProfile();
    } catch (err: any) {
      this.error.set(err.response?.data?.message || 'Failed to upload image');
    } finally {
      this.isLoading.set(false);
    }
  }

  async addAddress(): Promise<void> {
    this.error.set(null);
    this.successMessage.set(null);
    this.isLoading.set(true);

    try {
      await this.authService.addAddress(this.addressForm());
      this.successMessage.set('Address added successfully!');
      this.resetAddressForm();
      this.toggleAddAddress();
      this.loadUserProfile();
    } catch (err: any) {
      this.error.set(err.response?.data?.message || 'Failed to add address');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteAddress(addressId: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.authService.deleteAddress(addressId);
      this.successMessage.set('Address deleted successfully!');
      this.loadUserProfile();
    } catch (err: any) {
      this.error.set(err.response?.data?.message || 'Failed to delete address');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteAccount(): Promise<void> {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    this.isLoading.set(true);

    try {
      await this.authService.deleteAccount();
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error.set(err.response?.data?.message || 'Failed to delete account');
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (err) {
      this.router.navigate(['/login']);
    }
  }

  private resetAddressForm(): void {
    this.addressForm.set({
      street: '',
      wilaya: '',
      commune: '',
      codePostal: ''
    });
  }

  updateAddressForm(field: keyof AddressRequest, value: any): void {
    const current = this.addressForm();
    this.addressForm.set({ ...current, [field]: value });
  }

  updateProfileForm(field: keyof UpdateUserRequest, value: any): void {
    const current = this.profileForm();
    this.profileForm.set({ ...current, [field]: value });
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement)?.value || '';
  }

  parseAge(value: string): number {
    return parseInt(value, 10) || 0;
  }

  getImageUrl(imageURL: string | null): string {
    if (this.imagePreview()) {
      return this.imagePreview()!;
    }
    if (!imageURL) {
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect fill="#dee2e6" width="150" height="150"/><text fill="#6c757d" font-family="sans-serif" font-size="12" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No Photo</text></svg>');
    }
    return imageURL.startsWith('http')
      ? imageURL
      : `${environment.apiHost}${imageURL}`;
  }
}
