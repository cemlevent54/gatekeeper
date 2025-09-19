import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
}

interface RolePermissionMatrix {
    [roleId: string]: {
        [permissionId: string]: boolean;
    };
}

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
        <div class="page-header">
            <h1>Rol ve Yetki Yönetimi</h1>
            <p class="page-description">Roller ve izinler arasındaki ilişkileri yönetin</p>
        </div>

        <div class="matrix-container">
            <div class="matrix-table">
                <!-- Header Row -->
                <div class="matrix-header">
                    <div class="permission-header">İzinler</div>
                    <div class="roles-header">
                        <div class="role-header" *ngFor="let role of roles">
                            <div class="role-name">{{ role.name }}</div>
                            <div class="role-description">{{ role.description }}</div>
                        </div>
                    </div>
                </div>

                <!-- Permission Rows -->
                <div class="permission-rows">
                    <div class="permission-row" *ngFor="let permission of permissions">
                        <div class="permission-info">
                            <div class="permission-name">{{ permission.name }}</div>
                            <div class="permission-description">{{ permission.description }}</div>
                            <div class="permission-category">{{ permission.category }}</div>
                        </div>
                        <div class="permission-checkboxes">
                            <div class="checkbox-cell" *ngFor="let role of roles">
                                <p-checkbox 
                                    [checked]="isPermissionGranted(role.id, permission.id)"
                                    (onChange)="togglePermission(role.id, permission.id, $event.checked)"
                                    [binary]="true"
                                    inputId="{{ role.id }}-{{ permission.id }}"
                                    class="permission-checkbox"
                                ></p-checkbox>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="action-buttons">
            <button 
                pButton 
                type="button" 
                label="Tümünü Seç" 
                icon="pi pi-check"
                class="p-button-secondary"
                (click)="selectAllPermissions()"
            ></button>
            <button 
                pButton 
                type="button" 
                label="Tümünü Temizle" 
                icon="pi pi-times"
                class="p-button-secondary"
                (click)="clearAllPermissions()"
            ></button>
            <button 
                pButton 
                type="button" 
                label="Güncelle" 
                icon="pi pi-save"
                class="p-button-success"
                (click)="updatePermissions()"
                [disabled]="isUpdating"
            ></button>
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
    }

    .page-header {
        margin-bottom: 2rem;
        text-align: center;
    }

    .page-header h1 {
        color: #fff;
        font-size: 2rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
    }

    .page-description {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
        margin: 0;
    }

    .matrix-container {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 2rem;
    }

    .matrix-table {
        width: 100%;
    }

    .matrix-header {
        display: grid;
        grid-template-columns: 300px 1fr;
        background: rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .permission-header {
        padding: 1rem;
        font-weight: 600;
        color: #fff;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
    }

    .roles-header {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1px;
    }

    .role-header {
        padding: 1rem 0.5rem;
        text-align: center;
        background: rgba(255, 255, 255, 0.05);
        border-right: 1px solid rgba(255, 255, 255, 0.08);
    }

    .role-header:last-child {
        border-right: none;
    }

    .role-name {
        font-weight: 600;
        color: #fff;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
    }

    .role-description {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.2;
    }

    .permission-rows {
        max-height: 600px;
        overflow-y: auto;
    }

    .permission-row {
        display: grid;
        grid-template-columns: 300px 1fr;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        transition: background-color 0.2s ease;
    }

    .permission-row:hover {
        background: rgba(255, 255, 255, 0.02);
    }

    .permission-row:last-child {
        border-bottom: none;
    }

    .permission-info {
        padding: 1rem;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.02);
    }

    .permission-name {
        font-weight: 600;
        color: #fff;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
    }

    .permission-description {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 0.25rem;
        line-height: 1.3;
    }

    .permission-category {
        font-size: 0.7rem;
        color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        display: inline-block;
    }

    .permission-checkboxes {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1px;
    }

    .checkbox-cell {
        padding: 1rem 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.02);
    }

    .checkbox-cell:last-child {
        border-right: none;
    }

    .action-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }

    /* Custom Checkbox Styles */
    :host ::ng-deep .permission-checkbox {
        .p-checkbox-box {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            width: 18px;
            height: 18px;
        }

        .p-checkbox-box:hover {
            border-color: rgba(34, 197, 94, 0.5);
        }

        .p-checkbox-box.p-highlight {
            background: #22c55e;
            border-color: #22c55e;
        }

        .p-checkbox-icon {
            color: #fff;
            font-size: 0.8rem;
        }
    }

    /* Responsive */
    @media (max-width: 1200px) {
        .matrix-header,
        .permission-row {
            grid-template-columns: 250px 1fr;
        }

        .permission-info {
            padding: 0.75rem;
        }

        .role-header {
            padding: 0.75rem 0.25rem;
        }
    }

    @media (max-width: 768px) {
        .role-permissions-container {
            padding: 0.5rem;
        }

        .matrix-header,
        .permission-row {
            grid-template-columns: 200px 1fr;
        }

        .permission-info {
            padding: 0.5rem;
        }

        .role-header {
            padding: 0.5rem 0.25rem;
        }

        .checkbox-cell {
            padding: 0.5rem 0.25rem;
        }

        .action-buttons {
            flex-direction: column;
            align-items: center;
        }
    }

    /* Scrollbar Styling */
    .permission-rows::-webkit-scrollbar {
        width: 6px;
    }

    .permission-rows::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }

    .permission-rows::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    .permission-rows::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    `]
})
export class RolePermissionsComponent implements OnInit {
    roles: Role[] = [];
    permissions: Permission[] = [];
    rolePermissionMatrix: RolePermissionMatrix = {};
    isUpdating = false;

    constructor(private messageService: MessageService) { }

    ngOnInit(): void {
        this.initializeMockData();
        this.initializeMatrix();
    }

    private initializeMockData(): void {
        // Mock Roller
        this.roles = [
            {
                id: 'admin',
                name: 'Admin',
                description: 'Tam yetki'
            },
            {
                id: 'editor',
                name: 'Editör',
                description: 'İçerik editörü'
            },
            {
                id: 'viewer',
                name: 'Görüntüleyici',
                description: 'Sadece okuma'
            },
            {
                id: 'moderator',
                name: 'Moderatör',
                description: 'İçerik moderatörü'
            },
            {
                id: 'user',
                name: 'Kullanıcı',
                description: 'Standart kullanıcı'
            }
        ];

        // Mock İzinler
        this.permissions = [
            {
                id: 'user_create',
                name: 'Kullanıcı Oluştur',
                description: 'Yeni kullanıcı hesapları oluşturabilir',
                category: 'Kullanıcı Yönetimi'
            },
            {
                id: 'user_read',
                name: 'Kullanıcı Görüntüle',
                description: 'Kullanıcı bilgilerini görüntüleyebilir',
                category: 'Kullanıcı Yönetimi'
            },
            {
                id: 'user_update',
                name: 'Kullanıcı Güncelle',
                description: 'Kullanıcı bilgilerini güncelleyebilir',
                category: 'Kullanıcı Yönetimi'
            },
            {
                id: 'user_delete',
                name: 'Kullanıcı Sil',
                description: 'Kullanıcı hesaplarını silebilir',
                category: 'Kullanıcı Yönetimi'
            },
            {
                id: 'role_create',
                name: 'Rol Oluştur',
                description: 'Yeni roller oluşturabilir',
                category: 'Rol Yönetimi'
            },
            {
                id: 'role_read',
                name: 'Rol Görüntüle',
                description: 'Rol bilgilerini görüntüleyebilir',
                category: 'Rol Yönetimi'
            },
            {
                id: 'role_update',
                name: 'Rol Güncelle',
                description: 'Rol bilgilerini güncelleyebilir',
                category: 'Rol Yönetimi'
            },
            {
                id: 'role_delete',
                name: 'Rol Sil',
                description: 'Rolleri silebilir',
                category: 'Rol Yönetimi'
            },
            {
                id: 'content_create',
                name: 'İçerik Oluştur',
                description: 'Yeni içerik oluşturabilir',
                category: 'İçerik Yönetimi'
            },
            {
                id: 'content_read',
                name: 'İçerik Görüntüle',
                description: 'İçerikleri görüntüleyebilir',
                category: 'İçerik Yönetimi'
            },
            {
                id: 'content_update',
                name: 'İçerik Güncelle',
                description: 'İçerikleri güncelleyebilir',
                category: 'İçerik Yönetimi'
            },
            {
                id: 'content_delete',
                name: 'İçerik Sil',
                description: 'İçerikleri silebilir',
                category: 'İçerik Yönetimi'
            },
            {
                id: 'system_settings',
                name: 'Sistem Ayarları',
                description: 'Sistem ayarlarını değiştirebilir',
                category: 'Sistem Yönetimi'
            },
            {
                id: 'logs_view',
                name: 'Log Görüntüle',
                description: 'Sistem loglarını görüntüleyebilir',
                category: 'Sistem Yönetimi'
            }
        ];
    }

    private initializeMatrix(): void {
        // Admin rolüne tüm izinleri ver
        this.roles.forEach(role => {
            this.rolePermissionMatrix[role.id] = {};
            this.permissions.forEach(permission => {
                if (role.id === 'admin') {
                    this.rolePermissionMatrix[role.id][permission.id] = true;
                } else if (role.id === 'editor') {
                    // Editör için içerik yönetimi izinleri
                    this.rolePermissionMatrix[role.id][permission.id] =
                        permission.category === 'İçerik Yönetimi' ||
                        permission.id === 'user_read' ||
                        permission.id === 'role_read';
                } else if (role.id === 'moderator') {
                    // Moderatör için içerik ve kullanıcı okuma izinleri
                    this.rolePermissionMatrix[role.id][permission.id] =
                        (permission.category === 'İçerik Yönetimi' && permission.id !== 'content_create') ||
                        permission.id === 'user_read' ||
                        permission.id === 'role_read';
                } else if (role.id === 'viewer') {
                    // Görüntüleyici için sadece okuma izinleri
                    this.rolePermissionMatrix[role.id][permission.id] =
                        permission.id.includes('_read') || permission.id === 'content_read';
                } else {
                    // User için sadece temel izinler
                    this.rolePermissionMatrix[role.id][permission.id] = false;
                }
            });
        });
    }

    isPermissionGranted(roleId: string, permissionId: string): boolean {
        return this.rolePermissionMatrix[roleId]?.[permissionId] || false;
    }

    togglePermission(roleId: string, permissionId: string, granted: boolean): void {
        if (!this.rolePermissionMatrix[roleId]) {
            this.rolePermissionMatrix[roleId] = {};
        }
        this.rolePermissionMatrix[roleId][permissionId] = granted;
    }

    selectAllPermissions(): void {
        this.roles.forEach(role => {
            this.permissions.forEach(permission => {
                this.rolePermissionMatrix[role.id][permission.id] = true;
            });
        });

        this.messageService.add({
            severity: 'info',
            summary: 'Bilgi',
            detail: 'Tüm izinler seçildi'
        });
    }

    clearAllPermissions(): void {
        this.roles.forEach(role => {
            this.permissions.forEach(permission => {
                this.rolePermissionMatrix[role.id][permission.id] = false;
            });
        });

        this.messageService.add({
            severity: 'info',
            summary: 'Bilgi',
            detail: 'Tüm izinler temizlendi'
        });
    }

    updatePermissions(): void {
        this.isUpdating = true;

        // Mock güncelleme işlemi
        setTimeout(() => {
            this.isUpdating = false;

            this.messageService.add({
                severity: 'success',
                summary: 'Başarılı',
                detail: 'Rol izinleri başarıyla güncellendi'
            });

            console.log('Güncellenen izin matrisi:', this.rolePermissionMatrix);
        }, 1500);
    }
}
