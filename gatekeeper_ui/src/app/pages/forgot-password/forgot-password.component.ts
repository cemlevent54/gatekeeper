import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-forgot-password-page',
    standalone: true,
    imports: [FormsModule, RouterLink, InputTextModule, ButtonModule, ToastModule],
    providers: [MessageService],
    template: `
<p-toast></p-toast>

<section class="fp-shell">
  <div class="fp-card">
    <h2>Şifre Yenile</h2>
    <p class="subtitle">E-posta adresinizi girin, size bir yenileme bağlantısı gönderelim.</p>

    <div class="field">
      <label for="email">Email</label>
      <input pInputText id="email" [(ngModel)]="email" placeholder="example@domain.com" />
    </div>

    <button pButton type="button" label="Şifre Yenile" class="reset-btn" (click)="sendReset()"></button>

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
      .reset-btn { width: 100%; }
      .footer { display: flex; justify-content: center; margin-top: 1rem; }
      .link { color: var(--p-primary-color, #16a34a); text-decoration: none; font-size: .875rem; }
      .link:hover { text-decoration: underline; }
    `]
})
export class ForgotPasswordPageComponent {
    email = '';
    constructor(private messageService: MessageService) { }

    sendReset(): void {
        // TODO: burada backend'e reset mail talebi gonderilebilir (mock)
        this.messageService.add({ severity: 'success', summary: 'Bilgi', detail: 'Mailinizi kontrol ediniz.' });
    }
}


