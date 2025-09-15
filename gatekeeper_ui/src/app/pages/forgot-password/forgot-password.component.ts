import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [FormsModule, RouterLink, InputTextModule, ButtonModule, ToastModule, CommonModule],
  providers: [MessageService],
  template: `
<p-toast></p-toast>

<section class="fp-shell">
  <div class="fp-card">
    <h2>Şifre Yenile</h2>
    <p class="subtitle">E-posta adresinizi girin, size bir yenileme bağlantısı gönderelim.</p>

    <form (ngSubmit)="sendReset()" #forgotPasswordForm="ngForm">
    <div class="field">
      <label for="email">Email</label>
        <input pInputText 
               id="email" 
               type="email"
               name="email"
               [(ngModel)]="email" 
               placeholder="example@domain.com" 
               required
               email
               #emailInput="ngModel" />
        <div *ngIf="emailInput.invalid && emailInput.touched" class="error-message">
          <span *ngIf="emailInput.errors?.['required']">Email adresi gerekli</span>
          <span *ngIf="emailInput.errors?.['email']">Geçerli bir email adresi girin</span>
        </div>
    </div>

      <button pButton 
              type="submit" 
              [label]="isLoading ? 'Gönderiliyor...' : 'Şifre Yenile'" 
              class="reset-btn" 
              [disabled]="isLoading || !forgotPasswordForm.form.valid"></button>
    </form>

    <div class="footer">
      <a class="link" [routerLink]="['/login']">Giriş sayfasına dön</a>
    </div>
  </div>
</section>
    `,
  styles: [`
      .fp-shell { min-height: calc(100dvh - 80px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
      .fp-card { width: 100%; max-width: 420px; padding: 1.25rem 1.25rem 1.5rem; border-radius: 12px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); backdrop-filter: blur(6px); box-shadow: 0 10px 30px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.12); text-align: center; }
      h2 { margin: 0 0 .5rem; font-weight: 700; font-size: 1.5rem; }
      .subtitle { opacity: .8; margin: 0 0 1rem; }
      .field { display: flex; flex-direction: column; gap: .35rem; margin-bottom: .9rem; text-align: left; }
      label { font-size: .875rem; opacity: .9; }
      :host ::ng-deep .p-inputtext { width: 100%; }
      .error-message { 
        color: #ef4444; 
        font-size: 0.75rem; 
        margin-top: 0.25rem; 
        text-align: left;
      }
      .reset-btn { width: 100%; }
      .footer { display: flex; justify-content: center; margin-top: 1rem; }
      .link { color: var(--p-primary-color, #16a34a); text-decoration: none; font-size: .875rem; }
      .link:hover { text-decoration: underline; }
    `]
})
export class ForgotPasswordPageComponent {
  email = '';
  isLoading = false;

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  sendReset(): void {
    const email = (this.email ?? '').trim();

    if (!email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Email adresi gerekli'
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Geçerli bir email adresi girin'
      });
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: response.message || 'Şifre yenileme linki email adresinize gönderildi. Lütfen emailinizi kontrol edin.'
          });

          // Form'u temizle
          this.email = '';
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: response.message || 'Şifre yenileme isteği başarısız'
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('[ForgotPasswordComponent][ERROR]', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: error.message || 'Şifre yenileme isteği gönderilirken bir hata oluştu'
        });
      }
    });
  }
}


