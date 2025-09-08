import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-register-page',
    standalone: true,
    imports: [RouterLink, FormsModule, InputTextModule, PasswordModule, ButtonModule],
    template: `
<section class="register-shell">
  <div class="register-card">
    <h2>Kayıt Ol</h2>

    <div class="field">
      <label for="username">Kullanıcı Adı</label>
      <input pInputText id="username" [(ngModel)]="username" placeholder="kullaniciadi" />
    </div>

    <div class="field">
      <label for="email">Email</label>
      <input pInputText id="email" [(ngModel)]="email" placeholder="example@domain.com" />
    </div>

    <div class="field">
      <label for="password">Şifre</label>
      <p-password inputId="password" [toggleMask]="true" [feedback]="false" placeholder="••••••••" styleClass="w-full" [inputStyleClass]="'w-full'" />
    </div>

    <div class="field">
      <label for="confirm">Şifre (Tekrar)</label>
      <p-password inputId="confirm" [toggleMask]="true" [feedback]="false" placeholder="••••••••" styleClass="w-full" [inputStyleClass]="'w-full'" />
    </div>

    <button pButton type="button" label="Register" class="register-btn"></button>

    <div class="footer">
      <span>Zaten hesabınız var mı?</span>
      <a class="link" [routerLink]="['/login']">Giriş yapın</a>
    </div>
  </div>
</section>
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
}


