import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputOtpModule, ToastModule, CommonModule],
  template: `
<section class="verify-shell">
  <div class="verify-card">
    <h2>Hesabınızı Doğrulayın</h2>
    <p class="subtitle">Lütfen mailinize gönderilen 6 haneli kodu girin.</p>

    <div class="otp-row">
      <p-inputotp [(ngModel)]="code" [length]="6" [integerOnly]="true" styleClass="custom-otp"></p-inputotp>
    </div>

    <div class="actions">
      <button pButton type="button" 
              [label]="isLoading ? 'Doğrulanıyor...' : 'Kodu Doğrula'" 
              (click)="submit()"
              [disabled]="isLoading || code.length !== 6"></button>
    </div>

    <div class="resend-section" *ngIf="!isLoading">
      <p class="resend-text">Kodu almadınız mı?</p>
      <button pButton type="button" label="Tekrar Gönder" class="p-button-text" (click)="resendCode()"></button>
    </div>
  </div>
</section>
<p-toast></p-toast>
    `,
  styles: [`
      .verify-shell { 
        min-height: calc(100dvh - 80px); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        padding: 1.5rem; 
        box-sizing: border-box;
      }
      
      .verify-card { 
        width: 100%; 
        max-width: 420px; 
        padding: 1.25rem 1.25rem 1.5rem; 
        border-radius: 12px; 
        background: rgba(255,255,255,.06); 
        border: 1px solid rgba(255,255,255,.08); 
        backdrop-filter: blur(6px); 
        box-shadow: 0 10px 30px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.12); 
        text-align: center; 
        box-sizing: border-box;
      }
      h2 { margin: 0 0 .5rem; font-weight: 700; font-size: 1.5rem; }
      .subtitle { opacity: .8; margin: 0 0 1rem; }
      .otp-row { 
        display: flex; 
        justify-content: center; 
        align-items: center;
        margin: 1rem 0 1.5rem; 
        gap: 8px;
      }
      .actions { 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        margin-top: 1rem; 
        gap: 0.5rem;
      }
      
      .actions button {
        min-width: 140px;
        padding: 0.75rem 1.5rem;
        font-size: 0.9rem;
        border-radius: 8px;
        transition: all 0.2s ease;
      }
      
      .resend-section { 
        margin-top: 1.5rem; 
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }
      
      .resend-text { 
        opacity: .7; 
        margin: 0; 
        font-size: .875rem; 
      }
      
      .resend-section button {
        font-size: 0.8rem;
        padding: 0.5rem 1rem;
      }

      /* Custom OTP styling */
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

      /* Responsive OTP styling */
      @media (max-width: 400px) {
        .otp-row {
          flex-direction: column;
          gap: 12px;
        }
        
        :host ::ng-deep .custom-otp {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        :host ::ng-deep .custom-otp .p-inputotp-container {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        
        :host ::ng-deep .custom-otp .p-inputotp-input { 
          width: 44px; 
          height: 50px; 
          font-size: 1.1rem; 
          margin: 0;
        }
      }

      @media (max-width: 480px) and (min-width: 401px) {
        :host ::ng-deep .custom-otp .p-inputotp-input { 
          width: 44px; 
          height: 50px; 
          font-size: 1.1rem; 
          margin: 0 3px;
        }
        
        .verify-card { 
          padding: 1rem; 
          margin: 0.5rem;
        }
        
        h2 { 
          font-size: 1.25rem; 
        }
        
        .subtitle { 
          font-size: 0.875rem; 
        }
        
        .actions button {
          min-width: 120px;
          padding: 0.6rem 1.2rem;
          font-size: 0.85rem;
        }
        
        .resend-section button {
          font-size: 0.75rem;
          padding: 0.4rem 0.8rem;
        }
      }

      @media (max-width: 360px) {
        :host ::ng-deep .custom-otp .p-inputotp-input { 
          width: 38px; 
          height: 44px; 
          font-size: 1rem; 
          margin: 0;
        }
        
        :host ::ng-deep .custom-otp .p-inputotp-container {
          gap: 6px;
        }
        
        .actions button {
          min-width: 100px;
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
        }
        
        .resend-section button {
          font-size: 0.7rem;
          padding: 0.3rem 0.6rem;
        }
        
        .verify-card {
          padding: 0.75rem;
          margin: 0.25rem;
        }
      }
    `]
})
export class VerifyEmailPageComponent implements OnInit {
  code = '';
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
          detail: 'Geçersiz doğrulama linki'
        });
        this.router.navigate(['/login']);
      }
    });
  }

  submit(): void {
    if (this.code.length !== 6) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Lütfen 6 haneli kodu girin'
      });
      return;
    }

    if (!this.token) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Geçersiz doğrulama token\'ı'
      });
      return;
    }

    this.isLoading = true;

    this.authService.verifyEmail(this.code, this.token).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: response.message || 'Email doğrulama başarılı!'
          });

          // Login sayfasına yönlendir
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: response.message || 'Email doğrulama başarısız'
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('[VerifyEmailComponent][ERROR]', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: error.message || 'Email doğrulama sırasında bir hata oluştu'
        });
      }
    });
  }

  resendCode(): void {
    // Bu fonksiyon için ayrı bir endpoint gerekebilir
    // Şimdilik basit bir mesaj gösterelim
    this.messageService.add({
      severity: 'info',
      summary: 'Bilgi',
      detail: 'Yeni doğrulama kodu gönderildi. Lütfen emailinizi kontrol edin.'
    });
  }
}


