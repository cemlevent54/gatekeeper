import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, MenubarModule, ButtonModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
    isLoggedIn = false;
    items: MenuItem[] = [];

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.refreshAuthState();
        this.buildMenu();

        // localStorage değişikliklerini dinle
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', this.handleStorageChange.bind(this));
            window.addEventListener('authStateChanged', this.handleAuthStateChange.bind(this));
        }
    }

    ngOnDestroy(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('storage', this.handleStorageChange.bind(this));
            window.removeEventListener('authStateChanged', this.handleAuthStateChange.bind(this));
        }
    }

    private handleStorageChange(event: StorageEvent): void {
        if (event.key === 'jwt' || event.key === 'accessToken') {
            this.refreshAuthState();
            this.buildMenu();
        }
    }

    private handleAuthStateChange(): void {
        this.refreshAuthState();
        this.buildMenu();
    }

    refreshAuthState(): void {
        try {
            this.isLoggedIn = this.authService.isAuthenticated();
            console.log('Navbar auth state:', this.isLoggedIn);
        } catch {
            this.isLoggedIn = false;
        }
    }

    private buildMenu(): void {
        const baseItems: MenuItem[] = [
            { label: 'Ana Sayfa', icon: 'pi pi-home', routerLink: '/' },
            { label: 'Hakkında', icon: 'pi pi-info-circle', routerLink: '/about' },
            {
                label: 'Ayarlar',
                icon: 'pi pi-cog',
                items: [
                    { label: 'Profil', icon: 'pi pi-user', routerLink: '/profile' },
                    { label: 'Güvenlik', icon: 'pi pi-shield', routerLink: '/security' }
                ]
            }
        ];

        // Oturum bagimli eylemler end slot'ta gosteriliyor; sol menude tekrar etmeyelim
        this.items = baseItems;
    }

    login(): void {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('jwt', 'mockToken');
            }
        } finally {
            this.isLoggedIn = true;
            this.buildMenu();
        }
    }

    logout(): void {
        const refreshToken = this.authService.getRefreshToken();

        if (refreshToken) {
            // Backend'e logout isteği gönder
            this.authService.logout(refreshToken).subscribe({
                next: (response) => {
                    console.log('Logout successful:', response);
                    this.handleLogoutSuccess();
                },
                error: (error) => {
                    console.error('Logout error:', error);
                    // Hata olsa bile local logout yap
                    this.handleLogoutSuccess();
                }
            });
        } else {
            // Refresh token yoksa direkt local logout
            this.handleLogoutSuccess();
        }
    }

    private handleLogoutSuccess(): void {
        try {
            // AuthService ile token'ları temizle
            this.authService.clearTokens();

            // Navbar'ı güncellemek için custom event dispatch et
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('authStateChanged'));
            }
        } finally {
            this.isLoggedIn = false;
            this.buildMenu();
            // Ana sayfaya yönlendir
            window.location.href = '/';
        }
    }
}


