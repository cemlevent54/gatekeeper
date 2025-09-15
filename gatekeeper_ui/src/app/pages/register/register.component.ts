import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, FormsModule, InputTextModule, PasswordModule, ButtonModule, ToastModule, CommonModule],
  template: `
<section class="register-shell">
  <div class="register-card">
    <h2>Kayıt Ol</h2>

    <form (ngSubmit)="register()" #registerForm="ngForm">
      <div class="field">
        <label for="username">Kullanıcı Adı</label>
        <input pInputText id="username" [(ngModel)]="username" name="username" placeholder="kullaniciadi" required />
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input pInputText id="email" type="email" [(ngModel)]="email" name="email" placeholder="example@domain.com" required />
      </div>

      <div class="field">
        <label for="password">Şifre</label>
        <p-password inputId="password" [(ngModel)]="password" name="password" [toggleMask]="true" [feedback]="false" placeholder="••••••••" styleClass="w-full" [inputStyleClass]="'w-full'" required />
      </div>

      <div class="field">
        <label for="confirmPassword">Şifre (Tekrar)</label>
        <p-password inputId="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword" [toggleMask]="true" [feedback]="false" placeholder="••••••••" styleClass="w-full" [inputStyleClass]="'w-full'" required />
      </div>

      <button pButton type="submit" [label]="isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'" 
              class="register-btn" 
              [disabled]="isLoading || !registerForm.form.valid || password !== confirmPassword"></button>
    </form>

    <div class="footer">
      <span>Zaten hesabınız var mı?</span>
      <a class="link" [routerLink]="['/login']">Giriş yapın</a>
    </div>
  </div>
</section>
<p-toast></p-toast>
    `,
  styles: [`
      .register-shell { min-height: calc(100dvh - 80px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
      .register-card { width: 100%; max-width: 420px; padding: 1.25rem 1.25rem 1.5rem; border-radius: 12px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); backdrop-filter: blur(6px); box-shadow: 0 10px 30px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.12); }
      h2 { margin: 0 0 1rem; text-align: center; font-weight: 600; }
      .field { display: flex; flex-direction: column; gap: .35rem; margin-bottom: .9rem; }
      label { font-size: .875rem; opacity: .9; }
      :host ::ng-deep .p-inputtext, :host ::ng-deep .p-password-input { width: 100%; }
      .register-btn { width: 100%; }
      .footer { display: flex; justify-content: center; gap: .5rem; margin-top: 1rem; font-size: .9rem; }
      .link { color: var(--p-primary-color, #16a34a); text-decoration: none; font-size: .875rem; }
      .link:hover { text-decoration: underline; }
      @media (max-width: 600px) { .register-card { padding: 1rem; border-radius: 10px; } }
    `]
})
export class RegisterPageComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  register(): void {
    const username = (this.username ?? '').trim();
    const email = (this.email ?? '').trim();
    const password = (this.password ?? '').trim();
    const confirmPassword = (this.confirmPassword ?? '').trim();

    // Form validasyonu
    if (!username || !email || !password || !confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Tüm alanlar gerekli'
      });
      return;
    }

    if (password !== confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Şifreler eşleşmiyor'
      });
      return;
    }

    if (password.length < 6) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Şifre en az 6 karakter olmalıdır'
      });
      return;
    }

    this.isLoading = true;

    this.authService.register({ username, email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: response.message || 'Kayıt başarılı! Email doğrulama linki gönderildi.'
          });

          // Login sayfasına yönlendir
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: response.message || 'Kayıt başarısız'
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('[RegisterComponent][ERROR]', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: error.message || 'Kayıt yapılırken bir hata oluştu'
        });
      }
    });
  }
}


