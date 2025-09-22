import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PermissionsService, RolePermissionMatrix, RoleMatrixItem, PermissionMatrixItem } from '../../../services/permissions.service';

@Component({
    selector: 'app-role-permissions',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CheckboxModule,
        ToastModule
    ],
    template: `
    <div class="role-permissions-container">
        <h2 class="text-center">Rol ve Yetki Yönetimi</h2>

        <div class="actions-bar" *ngIf="matrix">
            <button 
                pButton 
                type="button" 
                label="Değişiklikleri Kaydet" 
                icon="pi pi-save"
                class="p-button-success"
                [disabled]="saving"
                (click)="saveChanges()"
            ></button>
            <button 
                pButton 
                type="button" 
                label="Yenile" 
                icon="pi pi-refresh"
                class="p-button-secondary"
                [disabled]="loading"
                (click)="refreshMatrix()"
            ></button>
        </div>

        <!-- Matrix Container -->
        <div class="matrix-container" *ngIf="!loading">
            <div class="matrix-table" *ngIf="matrix">
                <!-- Header Row -->
                <div class="matrix-header">
                    <div class="permission-header">İzinler</div>
                    <div class="roles-header">
                        <div class="role-header" *ngFor="let role of matrix.roles">
                            <div class="role-name">{{ role.name }}</div>
                            <div class="role-description">{{ role.description }}</div>
                        </div>
                    </div>
                </div>

                <!-- Permission Rows -->
                <div class="permission-rows">
                    <div class="permission-row" *ngFor="let permission of matrix.permissions">
                        <div class="permission-info">
                            <div class="permission-key">{{ permission.key }}</div>
                            <div class="permission-description">{{ permission.description }}</div>
                        </div>
                        <div class="permission-checkboxes">
                            <div class="checkbox-cell" *ngFor="let role of matrix.roles">
                                <p-checkbox 
                                    [ngModel]="isPermissionGranted(role.id, permission.id)"
                                    (ngModelChange)="togglePermission(role.id, permission.id, $event)"
                                    [binary]="true"
                                ></p-checkbox>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div class="loading-container" *ngIf="loading">
            <div class="loading-spinner">
                <i class="pi pi-spin pi-spinner"></i>
                <p>Rol-izin matrisi yükleniyor...</p>
            </div>
        </div>

        <!-- No Data State -->
        <div class="matrix-container" *ngIf="!loading && !matrix">
            <div class="no-data-container">
                <div class="no-data-content">
                    <i class="pi pi-exclamation-triangle"></i>
                    <h3>Veri Bulunamadı</h3>
                    <p>Rol-izin matrisi yüklenemedi. Lütfen sayfayı yenileyin.</p>
            <button 
                pButton 
                type="button" 
                        label="Yenile" 
                        icon="pi pi-refresh"
                        (click)="refreshMatrix()"
            ></button>
                </div>
            </div>
        </div>

    </div>

    <p-toast></p-toast>
    `,
    styles: [`
    .role-permissions-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1rem;
        min-height: 100vh;
        background: #000000;
        color: #fff;
    }

    .page-header {
        text-align: center;
        margin-bottom: 2rem;
        padding: 2rem 0;
    }

    .page-header h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        background: linear-gradient(45deg, #16a34a, #22c55e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .page-description {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
    }

    .actions-bar {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        justify-content: center;
    }

    .matrix-container {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        overflow: hidden;
        backdrop-filter: blur(10px);
    }

    .matrix-table {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    .matrix-header {
        display: flex;
        background: rgba(22, 163, 74, 0.1);
        border-bottom: 2px solid rgba(22, 163, 74, 0.3);
    }

    .permission-header {
        flex: 0 0 300px;
        padding: 1rem;
        font-weight: 600;
        font-size: 1.1rem;
        color: #16a34a;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .roles-header {
        display: flex;
        flex: 1;
        min-width: 480px;
    }

    .role-header {
        flex: 1;
        padding: 1rem;
        text-align: center;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .role-header:last-child {
        border-right: none;
    }

    .role-name {
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 0.25rem;
        color: #fff;
    }

    .role-description {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.6);
    }

    .permission-rows {
        max-height: 600px;
        overflow-y: auto;
        overflow-x: auto;
    }

    .permission-row {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        transition: background-color 0.2s ease;
    }

    .permission-row:hover {
        background: rgba(255, 255, 255, 0.02);
    }

    .permission-row:last-child {
        border-bottom: none;
    }

    .permission-info {
        flex: 0 0 300px;
        padding: 1rem;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        min-width: 240px;
    }

    .permission-key {
        font-weight: 500;
        font-size: 0.95rem;
        margin-bottom: 0.25rem;
        color: #fff;
    }

    .permission-description {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.3;
    }

    .permission-checkboxes {
        display: flex;
        flex: 1;
        min-width: 480px;
    }

    .checkbox-cell {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        border-right: 1px solid rgba(255, 255, 255, 0.05);
    }

    .checkbox-cell:last-child {
        border-right: none;
    }

    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
    }

    .loading-spinner {
        text-align: center;
    }

    .loading-spinner i {
        font-size: 2rem;
        color: #16a34a;
        margin-bottom: 1rem;
    }

    .loading-spinner p {
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
    }

    .no-data-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        padding: 2rem;
    }

    .no-data-content {
        text-align: center;
        max-width: 400px;
    }

    .no-data-content i {
        font-size: 3rem;
        color: rgba(255, 255, 255, 0.3);
        margin-bottom: 1rem;
    }

    .no-data-content h3 {
        color: #fff;
        margin: 0 0 0.5rem 0;
    }

    .no-data-content p {
        color: rgba(255, 255, 255, 0.6);
        margin: 0 0 1.5rem 0;
    }


    /* Responsive */
    @media (max-width: 1024px) {
        .role-permissions-container {
            padding: 0.5rem;
        }

        .page-header h1 {
            font-size: 2rem;
        }

        .permission-header { flex: 0 0 200px; }

        .permission-info { flex: 0 0 200px; min-width: 200px; }

        .role-name {
            font-size: 0.9rem;
        }

        .role-description {
            font-size: 0.8rem;
        }

        .permission-key {
            font-size: 0.9rem;
        }

        .permission-description { font-size: 0.75rem; }

        .roles-header { min-width: 360px; }
        .permission-checkboxes { min-width: 360px; }
    }

    @media (max-width: 640px) {
        .permission-header { flex: 0 0 160px; }
        .permission-info { flex: 0 0 160px; min-width: 160px; }
        .roles-header { min-width: 320px; }
        .permission-checkboxes { min-width: 320px; }
        .checkbox-cell { padding: 0.5rem; }
    }
    `]
})
export class RolePermissionsComponent implements OnInit {
    matrix: RolePermissionMatrix | null = null;
    loading = false; // Admin-users pattern'ine uygun olarak false
    saving = false;
    pendingChanges: { [roleId: string]: string[] } = {};
    isManualRefresh = false; // Manuel yenileme flag'i

    constructor(
        private messageService: MessageService,
        private permissionsService: PermissionsService
    ) { }

    ngOnInit(): void {
        this.loadMatrix();
    }

    loadMatrix(): void {
        this.loading = true;

        this.permissionsService.getRolePermissionMatrix().subscribe({
            next: (response) => {
                this.loading = false;
                if (response.success && response.data) {
                    this.matrix = response.data;
                    this.pendingChanges = {};
                    console.log('Rol-izin matrisi yüklendi:', this.matrix);
                } else {
                    this.matrix = null;
                    console.log('Matris API başarısız veya data yok:', response);
                    // Manuel yenileme ise hata mesajı göster
                    if (this.isManualRefresh) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Hata',
                            detail: response.message || 'Matris yüklenemedi'
                        });
                    }
                }
                this.isManualRefresh = false; // Flag'i sıfırla
            },
            error: (error) => {
                this.loading = false;
                console.error('Matris yüklenirken hata:', error);
                this.matrix = null;
                // Manuel yenileme ise hata mesajı göster
                if (this.isManualRefresh) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Hata',
                        detail: 'Matris yüklenirken bir hata oluştu'
                    });
                }
                this.isManualRefresh = false; // Flag'i sıfırla
            }
        });
    }

    refreshMatrix(): void {
        this.isManualRefresh = true; // Manuel yenileme flag'ini set et
        this.loadMatrix();
    }

    isPermissionGranted(roleId: string, permissionId: string): boolean {
        if (!this.matrix) return false;

        const role = this.matrix.roles.find(r => r.id === roleId);
        if (!role) return false;

        return role.permissions.some(p => p.id === permissionId);
    }

    togglePermission(roleId: string, permissionId: string, granted: boolean): void {
        if (!this.matrix) return;

        // Pending changes'i güncelle
        if (!this.pendingChanges[roleId]) {
            this.pendingChanges[roleId] = [];
        }

        const role = this.matrix.roles.find(r => r.id === roleId);
        if (!role) return;

        if (granted) {
            // Permission ekle
            if (!role.permissions.some(p => p.id === permissionId)) {
                const permission = this.matrix.permissions.find(p => p.id === permissionId);
                if (permission) {
                    role.permissions.push(permission);
                }
            }
        } else {
            // Permission kaldır
            role.permissions = role.permissions.filter(p => p.id !== permissionId);
        }

        // Pending changes'i güncelle
        this.pendingChanges[roleId] = role.permissions.map(p => p.id);
    }

    saveChanges(): void {
        if (!this.matrix || Object.keys(this.pendingChanges).length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Uyarı',
                detail: 'Kaydedilecek değişiklik bulunamadı'
            });
            return;
        }

        this.saving = true;
        const savePromises = Object.keys(this.pendingChanges).map(roleId =>
            this.permissionsService.updateRolePermissions(roleId, {
                permissionIds: this.pendingChanges[roleId]
            }).toPromise()
        );

        Promise.all(savePromises).then(() => {
            this.messageService.add({
                severity: 'success',
                summary: 'Başarılı',
                detail: 'Tüm değişiklikler kaydedildi'
            });
            this.pendingChanges = {};
            this.saving = false;
        }).catch((error) => {
            console.error('Değişiklikler kaydedilirken hata:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'Değişiklikler kaydedilirken bir hata oluştu'
            });
            this.saving = false;
        });
    }
}