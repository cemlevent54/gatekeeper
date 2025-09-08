import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-home-page',
    standalone: true,
    imports: [RouterLink, ButtonModule],
    template: `
<section class="home">
  <div class="hero">
    <h1>Gatekeeper</h1>
    <p>Basit, güvenli ve hızlı giriş deneyimi için örnek bir Angular uygulaması.</p>
    <div class="cta">
      <button pButton label="Hemen Başla" [routerLink]="['/register']"></button>
      <button pButton label="Giriş Yap" class="p-button-text" [routerLink]="['/login']"></button>
    </div>
  </div>
</section>
    `,
    styles: [`
      .home { padding: 2rem 1rem; display: flex; justify-content: center; }
      .hero { max-width: 900px; width: 100%; text-align: center; margin-top: 2rem; }
      .hero h1 { font-size: 2.25rem; margin-bottom: .75rem; }
      .hero p { opacity: .8; margin-bottom: 1.25rem; }
      .cta { display: flex; gap: .75rem; justify-content: center; }
      @media (max-width: 600px) { .hero h1 { font-size: 1.75rem; } }
    `]
})
export class HomePageComponent { }


