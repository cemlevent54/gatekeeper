import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '@shared/sidebar/sidebar.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ButtonModule],
  template: `
    <div class="admin-layout">
      <app-sidebar #sidebar />
      <main class="admin-content">
        <div class="mobile-header">
          <button 
            pButton 
            type="button" 
            icon="pi pi-bars" 
            class="p-button-text mobile-menu-btn"
            (click)="toggleMobileMenu()"
          ></button>
        </div>
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #0a0a0a;
    }

    .admin-content {
      flex: 1;
      padding: 2rem;
      margin-left: 280px;
      transition: margin-left 0.3s ease;
    }

    .mobile-header {
      display: none;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 1rem;
    }

    .mobile-menu-btn {
      color: #fff !important;
      font-size: 1.25rem !important;
    }

    @media (max-width: 768px) {
      .admin-content {
        margin-left: 0;
        padding: 0;
      }

      .mobile-header {
        display: block;
      }
    }
  `]
})
export class AdminLayoutComponent {
  @ViewChild('sidebar') sidebar!: SidebarComponent;

  toggleMobileMenu(): void {
    this.sidebar.toggleSidebar();
  }
}
