import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed" [class.mobile-open]="isMobileOpen">
      <div class="sidebar-header">
        <h3 class="logo" *ngIf="!isCollapsed">Admin Panel</h3>
        <button 
          pButton 
          type="button" 
          icon="pi pi-bars" 
          class="p-button-text toggle-btn"
          (click)="toggleSidebar()"
        ></button>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li *ngFor="let item of menuItems" class="nav-item">
            <a 
              [routerLink]="item.routerLink" 
              routerLinkActive="active"
              class="nav-link"
              [class.has-children]="item.children"
              (click)="toggleSubmenu(item)"
            >
              <i [class]="item.icon"></i>
              <span *ngIf="!isCollapsed" class="nav-label">{{ item.label }}</span>
              <i 
                *ngIf="item.children && !isCollapsed" 
                class="pi pi-chevron-down submenu-icon"
                [class.rotated]="item.expanded"
              ></i>
            </a>
            
            <ul 
              *ngIf="item.children && item.expanded && !isCollapsed" 
              class="submenu"
            >
              <li *ngFor="let child of item.children" class="submenu-item">
                <a 
                  [routerLink]="child.routerLink" 
                  routerLinkActive="active"
                  class="submenu-link"
                >
                  <i [class]="child.icon"></i>
                  <span>{{ child.label }}</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      
      <div class="sidebar-footer">
        <button 
          pButton 
          type="button" 
          label="Çıkış Yap" 
          icon="pi pi-sign-out"
          class="p-button-text logout-btn"
          (click)="logout()"
        ></button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      background: rgba(255, 255, 255, 0.06);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(6px);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      transition: width 0.3s ease;
    }

    .sidebar.collapsed {
      width: 60px;
    }

    .sidebar-header {
      padding: 1.5rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #fff;
    }

    .toggle-btn {
      color: #fff !important;
      padding: 0.5rem !important;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin-bottom: 0.25rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .nav-link.active {
      background: rgba(22, 163, 74, 0.2);
      color: #16a34a;
      border-right: 3px solid #16a34a;
    }

    .nav-link i {
      margin-right: 0.75rem;
      width: 20px;
      text-align: center;
    }

    .nav-label {
      flex: 1;
    }

    .submenu-icon {
      transition: transform 0.2s ease;
      margin-left: auto;
    }

    .submenu-icon.rotated {
      transform: rotate(180deg);
    }

    .submenu {
      list-style: none;
      margin: 0;
      padding: 0;
      background: rgba(0, 0, 0, 0.2);
    }

    .submenu-item {
      margin: 0;
    }

    .submenu-link {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem 0.5rem 3rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .submenu-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .submenu-link.active {
      background: rgba(22, 163, 74, 0.15);
      color: #16a34a;
    }

    .submenu-link i {
      margin-right: 0.5rem;
      width: 16px;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .logout-btn {
      width: 100%;
      color: rgba(255, 255, 255, 0.8) !important;
      justify-content: flex-start !important;
    }

    .logout-btn:hover {
      color: #ef4444 !important;
      background: rgba(239, 68, 68, 0.1) !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }

      .sidebar.collapsed {
        width: 280px;
        transform: translateX(-100%);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isMobileOpen = false;
  menuItems: (MenuItem & { expanded?: boolean })[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/admin/dashboard'
      },
      {
        label: 'Hesabım',
        icon: 'pi pi-user',
        routerLink: '/admin/account'
      },
      {
        label: 'Kullanıcılar',
        icon: 'pi pi-users',
        routerLink: '/admin/users'
      },
      {
        label: 'İçerik Yönetimi',
        icon: 'pi pi-file-edit',
        children: [
          {
            label: 'Sayfalar',
            icon: 'pi pi-file',
            routerLink: '/admin/pages'
          },
          {
            label: 'Blog',
            icon: 'pi pi-book',
            routerLink: '/admin/blog'
          },
          {
            label: 'Medya',
            icon: 'pi pi-image',
            routerLink: '/admin/media'
          }
        ]
      },
      {
        label: 'Ayarlar',
        icon: 'pi pi-cog',
        children: [
          {
            label: 'Genel',
            icon: 'pi pi-sliders-h',
            routerLink: '/admin/settings/general'
          },
          {
            label: 'Güvenlik',
            icon: 'pi pi-shield',
            routerLink: '/admin/settings/security'
          },
          {
            label: 'Email',
            icon: 'pi pi-envelope',
            routerLink: '/admin/settings/email'
          }
        ]
      },
      {
        label: 'Raporlar',
        icon: 'pi pi-chart-bar',
        routerLink: '/admin/reports'
      }
    ];
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 768) {
      this.isMobileOpen = !this.isMobileOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  toggleSubmenu(item: MenuItem & { expanded?: boolean }): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  logout(): void {
    const refreshToken = this.authService.getRefreshToken();

    if (refreshToken) {
      this.authService.logout(refreshToken).subscribe({
        next: (response) => {
          console.log('[SidebarComponent][Logout] Success:', response);
          this.handleLogoutSuccess();
        },
        error: (error) => {
          console.error('[SidebarComponent][Logout] Error:', error);
          this.handleLogoutSuccess(); // Even if error, perform local logout
        }
      });
    } else {
      this.handleLogoutSuccess();
    }
  }

  private handleLogoutSuccess(): void {
    try {
      this.authService.clearTokens();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authStateChanged'));
      }
    } finally {
      this.router.navigate(['/login']).then(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      });
    }
  }
}
