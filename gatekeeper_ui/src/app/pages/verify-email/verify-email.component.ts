import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
    selector: 'app-verify-email-page',
    standalone: true,
    imports: [FormsModule, ButtonModule, InputOtpModule],
    template: `
<section class="verify-shell">
  <div class="verify-card">
    <h2>Hesabınızı Doğrulayın</h2>
    <p class="subtitle">Lütfen mailinize gönderilen 6 haneli kodu girin.</p>

    <div class="otp-row">
      <p-inputotp [(ngModel)]="code" [length]="6" [integerOnly]="true" styleClass="custom-otp"></p-inputotp>
    </div>

    <div class="actions">
      <button pButton type="button" label="Kodu Gönder" (click)="submit()"></button>
    </div>
  </div>
</section>
    `,
    styles: [`
      .verify-shell { min-height: calc(100dvh - 80px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
      .verify-card { width: 100%; max-width: 420px; padding: 1.25rem 1.25rem 1.5rem; border-radius: 12px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); backdrop-filter: blur(6px); box-shadow: 0 10px 30px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.12); text-align: center; }
      h2 { margin: 0 0 .5rem; font-weight: 700; font-size: 1.5rem; }
      .subtitle { opacity: .8; margin: 0 0 1rem; }
      .otp-row { display: flex; justify-content: center; margin: .5rem 0 1rem; }
      .actions { display: flex; align-items: center; justify-content: center; margin-top: 1rem; }

      /* Custom OTP styling */
      :host ::ng-deep .custom-otp .p-inputotp-input { width: 42px; height: 48px; text-align: center; font-size: 1.1rem; }
      :host ::ng-deep .custom-otp .p-inputotp-separator { display: inline-flex; align-items: center; justify-content: center; width: 24px; opacity: .6; }
      :host ::ng-deep .custom-otp .p-inputotp-separator::before { content: '\e916'; font-family: 'primeicons'; }
    `]
})
export class VerifyEmailPageComponent {
    code = '';
    submit(): void {
        // TODO: backend'e doğrulama POST istegi at (mock)
        console.log('Girilen kod:', this.code);
    }
}


