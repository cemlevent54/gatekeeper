import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, MenubarModule, ButtonModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
    isLoggedIn = false;
    items: MenuItem[] = [];

    ngOnInit(): void {
        this.refreshAuthState();
        this.buildMenu();
    }

    refreshAuthState(): void {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
            this.isLoggedIn = !!token;
            console.log('Navbar auth state:', this.isLoggedIn, 'Token:', token);
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
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('jwt');
            }
        } finally {
            this.isLoggedIn = false;
            this.buildMenu();
        }
    }
}


