import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [RouterLink, FormsModule, InputTextModule, PasswordModule, ButtonModule, ToastModule],
    template: `
<section class="login-shell">
  <div class="login-card">
    <h2>Giriş Yap</h2>

    <div class="field flex flex-col gap-2">
      <label for="username">Username veya Email</label>
      <input pInputText id="username" aria-describedby="username-help" [(ngModel)]="usernameOrEmail" placeholder="example@domain.com" />
    </div>

    <div class="field">
      <label for="password">Şifre</label>
      <input id="password" type="password" pPassword [(ngModel)]="password" placeholder="••••••••" />
    </div>

    <button pButton type="button" label="Giriş Yap" class="login-btn" (click)="mockLogin()"></button>
    
    <br> <br>

    <div class="actions">
      <a class="link" [routerLink]="['/forgot-password']">Şifremi unuttum</a>
    </div>

    <div class="footer">
      <span>Hesabınız yok mu?</span>
      <a class="link" [routerLink]="['/register']">Kayıt olun</a>
    </div>
  </div>
</section>
<p-toast></p-toast>
    `,
    styles: [`
      .login-shell { min-height: calc(100dvh - 80px); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
      .login-card { width: 100%; max-width: 420px; padding: 1.25rem 1.25rem 1.5rem; border-radius: 12px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); backdrop-filter: blur(6px); box-shadow: 0 10px 30px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.12); }
      h2 { margin: 0 0 1rem; text-align: center; font-weight: 600; }
      .field { display: flex; flex-direction: column; gap: .35rem; margin-bottom: .9rem; }
      label { font-size: .875rem; opacity: .9; }
      :host ::ng-deep .p-inputtext, :host ::ng-deep .p-password-input { width: 100%; }
      .actions { display: flex; justify-content: center; margin: .25rem 0 1rem; width: 100%; }
      .link { color: var(--p-primary-color, #16a34a); text-decoration: none; font-size: .875rem; }
      .link:hover { text-decoration: underline; }
      .login-btn { width: 100%; }
      .footer { display: flex; justify-content: center; gap: .5rem; margin-top: 1rem; font-size: .9rem; }
      
      /* Toast responsive stilleri */
      :host ::ng-deep .p-toast {
        width: 90vw !important;
        max-width: 400px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        margin: 0 !important;
      }
      
      :host ::ng-deep .p-toast .p-toast-message {
        margin: 0.5rem 0 !important;
        border-radius: 8px !important;
        font-size: 0.875rem !important;
      }
      
      :host ::ng-deep .p-toast .p-toast-message-content {
        padding: 0.75rem 1rem !important;
      }
      
      @media (max-width: 600px) { 
        .login-card { padding: 1rem; border-radius: 10px; }
        
        :host ::ng-deep .p-toast {
          width: 95vw !important;
          max-width: 350px !important;
        }
        
        :host ::ng-deep .p-toast .p-toast-message {
          font-size: 0.8rem !important;
        }
        
        :host ::ng-deep .p-toast .p-toast-message-content {
          padding: 0.6rem 0.8rem !important;
        }
      }
      
      @media (max-width: 480px) {
        :host ::ng-deep .p-toast {
          width: 98vw !important;
          max-width: 320px !important;
        }
        
        :host ::ng-deep .p-toast .p-toast-message {
          font-size: 0.75rem !important;
        }
      }
    `]
})
export class LoginPageComponent {
    usernameOrEmail = '';
    password = '';

    constructor(private router: Router, private messageService: MessageService) { }

    mockLogin(): void {
        const uname = (this.usernameOrEmail ?? '').trim();
        const pwd = (this.password ?? '').trim();
        if (!uname || !pwd) {
            console.log("uname: ", uname);
            console.log("pwd: ", pwd);
            console.warn('Geçersiz kullanıcı veya şifre');
            this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'Kullanıcı adı ve şifre gerekli'
            });
            return;
        }
        if (typeof window !== 'undefined') {
            localStorage.setItem('jwt', 'mockToken');
            this.messageService.add({
                severity: 'success',
                summary: 'Başarılı',
                detail: 'Giriş yapıldı!'
            });
            // Ana sayfaya yönlendir ve navbar'ı güncelle
            setTimeout(() => {
                this.router.navigate(['/home']).then(() => {
                    // Navbar'ı güncellemek için sayfayı yenile
                    window.location.reload();
                });
            }, 1000);
        }
    }
}


