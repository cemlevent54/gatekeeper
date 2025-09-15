import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [FormsModule, InputOtpModule, PasswordModule, ButtonModule, ToastModule, CommonModule],
  template: `
<section class="rp-shell">
  <div class="rp-card">
    <h2>Şifre Sıfırla</h2>
    <p class="subtitle">E‑postanıza gönderilen 6 haneli kodu ve yeni şifrenizi girin.</p>

    <form #resetPasswordForm="ngForm">
      <div class="otp-row">
        <p-inputotp [(ngModel)]="code" 
                    name="code"
                    [length]="6" 
                    [integerOnly]="true" 
                    styleClass="custom-otp"
                    required
                    #codeInput="ngModel"></p-inputotp>
        <div *ngIf="codeInput.invalid && codeInput.touched" class="error-message">
          <span>6 haneli kodu girin</span>
        </div>
      </div>

      <div class="field">
        <label for="password">Yeni Şifre</label>
        <p-password inputId="password" 
                    name="password"
                    [(ngModel)]="password"
                    [toggleMask]="true" 
                    [feedback]="false" 
                    placeholder="••••••••" 
                    styleClass="w-full" 
                    [inputStyleClass]="'w-full'"
                    required
                    [minlength]="6"
                    #passwordInput="ngModel" />
        <div *ngIf="passwordInput.invalid && passwordInput.touched" class="error-message">
          <span *ngIf="passwordInput.errors?.['required']">Şifre gerekli</span>
          <span *ngIf="passwordInput.errors?.['minlength']">Şifre en az 6 karakter olmalıdır</span>
        </div>
      </div>

      <div class="field">
        <label for="confirm">Şifre (Tekrar)</label>
        <p-password inputId="confirm" 
                    name="confirmPassword"
                    [(ngModel)]="confirmPassword"
                    [toggleMask]="true" 
                    [feedback]="false" 
                    placeholder="••••••••" 
                    styleClass="w-full" 
                    [inputStyleClass]="'w-full'"
                    required
                    #confirmInput="ngModel" />
        <div *ngIf="confirmInput.invalid && confirmInput.touched" class="error-message">
          <span *ngIf="confirmInput.errors?.['required']">Şifre tekrarı gerekli</span>
        </div>
        <div *ngIf="password !== confirmPassword && confirmPassword" class="error-message">
          <span>Şifreler eşleşmiyor</span>
        </div>
      </div>

      <button pButton 
              type="button" 
              [label]="isLoading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'" 
              class="submit-btn" 
              [disabled]="isLoading || !code || code.length !== 6 || !password || password.length < 6 || password !== confirmPassword"
              (click)="submit()"></button>
    </form>
  </div>
</section>
<p-toast></p-toast>
    `,
  styles: [`
      .rp-shell { min-height: calc(100dvh - 80px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
      .rp-card { width: 100%; max-width: 420px; padding: 1.25rem 1.25rem 1.5rem; border-radius: 12px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); backdrop-filter: blur(6px); box-shadow: 0 10px 30px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.12); }
      h2 { margin: 0 0 .5rem; font-weight: 700; font-size: 1.5rem; text-align: center; }
      .subtitle { opacity: .8; margin: 0 0 1rem; text-align: center; }
      .otp-row { 
        display: flex; 
        flex-direction: column;
        align-items: center;
        margin: .5rem 0 1rem; 
      }
      .field { display: flex; flex-direction: column; gap: .35rem; margin-bottom: .9rem; }
      label { font-size: .875rem; opacity: .9; }
      :host ::ng-deep .p-inputtext, :host ::ng-deep .p-password-input { width: 100%; }
      .error-message { 
        color: #ef4444; 
        font-size: 0.75rem; 
        margin-top: 0.25rem; 
        text-align: center;
      }
      .submit-btn { width: 100%; margin-top: .5rem; }
      :host ::ng-deep .custom-otp .p-inputotp-input { 
        width: 50px; 
        height: 56px; 
        text-align: center; 
        font-size: 1.25rem; 
        font-weight: 600;
        border-radius: 12px;
        border: 2px solid rgba(255,255,255,.15);
        background: rgba(255,255,255,.08);
        color: white;
        transition: all 0.3s ease;
        margin: 0 4px;
      }
      
      :host ::ng-deep .custom-otp .p-inputotp-input:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        background: rgba(255,255,255,.12);
        transform: scale(1.05);
      }
      
      :host ::ng-deep .custom-otp .p-inputotp-input:not(:placeholder-shown) {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }
      
      :host ::ng-deep .custom-otp .p-inputotp-separator { 
        display: none; 
      }
    `]
})
export class ResetPasswordPageComponent implements OnInit {
  code = '';
  password = '';
  confirmPassword = '';
  token = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // URL'den token parametresini al
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Geçersiz şifre sıfırlama linki'
        });
        this.router.navigate(['/login']);
      }
    });
  }

  submit(): void {
    const code = (this.code ?? '').trim();
    const password = (this.password ?? '').trim();
    const confirmPassword = (this.confirmPassword ?? '').trim();

    // Validasyonlar
    if (!code || code.length !== 6) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: '6 haneli kodu girin'
      });
      return;
    }

    if (!password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Şifre gerekli'
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

    if (password !== confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Şifreler eşleşmiyor'
      });
      return;
    }

    if (!this.token) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Geçersiz şifre sıfırlama token\'ı'
      });
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(code, password, this.token).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: response.message || 'Şifreniz başarıyla sıfırlandı!'
          });

          // Login sayfasına yönlendir
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: response.message || 'Şifre sıfırlama başarısız'
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('[ResetPasswordComponent][ERROR]', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: error.message || 'Şifre sıfırlama sırasında bir hata oluştu'
        });
      }
    });
  }
}


