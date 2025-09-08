import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-reset-password-page',
    standalone: true,
    imports: [FormsModule, InputOtpModule, PasswordModule, ButtonModule],
    template: `
<section class="rp-shell">
  <div class="rp-card">
    <h2>Şifre Sıfırla</h2>
    <p class="subtitle">E‑postanıza gönderilen 6 haneli kodu ve yeni şifrenizi girin.</p>

    <div class="otp-row">
      <p-inputotp [(ngModel)]="code" [length]="6" [integerOnly]="true" styleClass="custom-otp"></p-inputotp>
    </div>

    <div class="field">
      <label for="password">Yeni Şifre</label>
      <p-password inputId="password" [toggleMask]="true" [feedback]="false" placeholder="••••••••" styleClass="w-full" [inputStyleClass]="'w-full'" />
    </div>

    <div class="field">
      <label for="confirm">Şifre (Tekrar)</label>
      <p-password inputId="confirm" [toggleMask]="true" [feedback]="false" placeholder="••••••••" styleClass="w-full" [inputStyleClass]="'w-full'" />
    </div>

    <button pButton type="button" label="Şifreyi Sıfırla" class="submit-btn" (click)="submit()"></button>
  </div>
</section>
    `,
    styles: [`
      .rp-shell { min-height: calc(100dvh - 80px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
      .rp-card { width: 100%; max-width: 420px; padding: 1.25rem 1.25rem 1.5rem; border-radius: 12px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); backdrop-filter: blur(6px); box-shadow: 0 10px 30px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.12); }
      h2 { margin: 0 0 .5rem; font-weight: 700; font-size: 1.5rem; text-align: center; }
      .subtitle { opacity: .8; margin: 0 0 1rem; text-align: center; }
      .otp-row { display: flex; justify-content: center; margin: .5rem 0 1rem; }
      .field { display: flex; flex-direction: column; gap: .35rem; margin-bottom: .9rem; }
      label { font-size: .875rem; opacity: .9; }
      :host ::ng-deep .p-inputtext, :host ::ng-deep .p-password-input { width: 100%; }
      .submit-btn { width: 100%; margin-top: .5rem; }
      :host ::ng-deep .custom-otp .p-inputotp-input { width: 42px; height: 48px; text-align: center; font-size: 1.1rem; }
    `]
})
export class ResetPasswordPageComponent {
    code = '';
    submit(): void {
        // TODO: backend dogrulama ve sifirla endpointine baglan (mock)
        console.log('Sifre sifirlama istegi:', { code: this.code });
    }
}


