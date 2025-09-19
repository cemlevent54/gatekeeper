import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, DataTableColumn, DataTableAction } from '../../../../../components/common/datatable.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

@Component({
    selector: 'app-role-permissions-list',
    standalone: true,
    imports: [
        CommonModule,
        DataTableComponent,
        ToastModule,
        ConfirmDialogModule
    ],
    template: `
    <div class="permissions-container">
      <!-- Basit Butonlar -->
      <div class="simple-actions">
        <button class="btn btn-primary" (click)="goToMatrix()">
          <i class="pi pi-shield"></i>
          Yetki Yönetimi
        </button>
        <button class="btn btn-success" (click)="addPermission()">
          <i class="pi pi-plus"></i>
          Yeni İzin Ekle
        </button>
      </div>

      <app-datatable
        [data]="permissions"
        [columns]="columns"
        [actions]="actions"
        [title]="'İzin Yönetimi'"
        [subtitle]="'Sistemdeki tüm izinleri görüntüleyin ve yönetin'"
        [showSearch]="true"
        [paginator]="true"
        [rows]="10"
        [loading]="loading"
        (actionClick)="onActionClick($event)"
      ></app-datatable>
    </div>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    `,
    styles: [`
    .permissions-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem;
    }

    .simple-actions {
      margin-bottom: 1rem;
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    `]
})
export class RolePermissionsListComponent implements OnInit {
    permissions: Permission[] = [];
    loading = false;

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) { }

    columns: DataTableColumn[] = [
        {
            field: 'name',
            header: 'İzin Adı',
            sortable: true,
            filterable: true,
            type: 'text',
            width: '200px'
        },
        {
            field: 'description',
            header: 'Açıklama',
            sortable: true,
            filterable: true,
            type: 'text',
            width: '300px'
        },
        {
            field: 'category',
            header: 'Kategori',
            sortable: true,
            filterable: true,
            type: 'text',
            width: '150px'
        },
        {
            field: 'isActive',
            header: 'Durum',
            sortable: true,
            filterable: true,
            type: 'status',
            width: '120px',
            align: 'center'
        },
        {
            field: 'createdAt',
            header: 'Oluşturulma',
            sortable: true,
            filterable: false,
            type: 'date',
            width: '150px'
        },
        {
            field: 'actions',
            header: 'İşlemler',
            sortable: false,
            filterable: false,
            type: 'actions',
            width: '120px',
            align: 'center'
        }
    ];

    actions: DataTableAction[] = [
        {
            label: 'Düzenle',
            icon: 'pi pi-pencil',
            severity: 'primary',
            tooltip: 'İzni düzenle'
        },
        {
            label: 'Sil',
            icon: 'pi pi-trash',
            severity: 'danger',
            tooltip: 'İzni sil',
            disabled: (rowData: Permission) => !rowData.isActive
        }
    ];

    ngOnInit(): void {
        this.loadPermissions();
    }

    loadPermissions(): void {
        this.loading = true;
        console.log('[RolePermissionsListComponent][loadPermissions] İzinler yükleniyor...');

        // Mock data - gerçek uygulamada service'den gelecek
        setTimeout(() => {
            this.permissions = [
                {
                    id: 'user_create',
                    name: 'Kullanıcı Oluştur',
                    description: 'Yeni kullanıcı hesapları oluşturabilir',
                    category: 'Kullanıcı Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'user_read',
                    name: 'Kullanıcı Görüntüle',
                    description: 'Kullanıcı bilgilerini görüntüleyebilir',
                    category: 'Kullanıcı Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'user_update',
                    name: 'Kullanıcı Güncelle',
                    description: 'Kullanıcı bilgilerini güncelleyebilir',
                    category: 'Kullanıcı Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'user_delete',
                    name: 'Kullanıcı Sil',
                    description: 'Kullanıcı hesaplarını silebilir',
                    category: 'Kullanıcı Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'role_create',
                    name: 'Rol Oluştur',
                    description: 'Yeni roller oluşturabilir',
                    category: 'Rol Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'role_read',
                    name: 'Rol Görüntüle',
                    description: 'Rol bilgilerini görüntüleyebilir',
                    category: 'Rol Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'role_update',
                    name: 'Rol Güncelle',
                    description: 'Rol bilgilerini güncelleyebilir',
                    category: 'Rol Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'role_delete',
                    name: 'Rol Sil',
                    description: 'Rolleri silebilir',
                    category: 'Rol Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'content_create',
                    name: 'İçerik Oluştur',
                    description: 'Yeni içerik oluşturabilir',
                    category: 'İçerik Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'content_read',
                    name: 'İçerik Görüntüle',
                    description: 'İçerikleri görüntüleyebilir',
                    category: 'İçerik Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'content_update',
                    name: 'İçerik Güncelle',
                    description: 'İçerikleri güncelleyebilir',
                    category: 'İçerik Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'content_delete',
                    name: 'İçerik Sil',
                    description: 'İçerikleri silebilir',
                    category: 'İçerik Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'system_settings',
                    name: 'Sistem Ayarları',
                    description: 'Sistem ayarlarını değiştirebilir',
                    category: 'Sistem Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'logs_view',
                    name: 'Log Görüntüle',
                    description: 'Sistem loglarını görüntüleyebilir',
                    category: 'Sistem Yönetimi',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'permission_manage',
                    name: 'İzin Yönetimi',
                    description: 'Sistem izinlerini yönetebilir',
                    category: 'Sistem Yönetimi',
                    isActive: false,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                }
            ];

            this.loading = false;
            console.log('[RolePermissionsListComponent][loadPermissions] İzinler yüklendi:', this.permissions.length);
        }, 1000);
    }

    onActionClick(event: { action: DataTableAction, rowData: Permission, rowIndex: number }): void {
        const { action, rowData, rowIndex } = event;

        switch (action.label) {
            case 'Düzenle':
                this.editPermission(rowData);
                break;
            case 'Sil':
                this.deletePermission(rowData);
                break;
            default:
                console.log('Bilinmeyen aksiyon:', action.label);
        }
    }

    private editPermission(permission: Permission): void {
        console.log('[RolePermissionsListComponent][editPermission] İzin düzenleniyor:', permission);

        // Mock edit işlemi
        this.messageService.add({
            severity: 'info',
            summary: 'Bilgi',
            detail: `${permission.name} izni düzenleme özelliği yakında eklenecek`
        });
    }

    private deletePermission(permission: Permission): void {
        this.confirmationService.confirm({
            message: `"${permission.name}" iznini silmek istediğinizden emin misiniz?`,
            header: 'İzin Silme Onayı',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Evet',
            rejectLabel: 'Hayır',
            accept: () => {
                this.performDeletePermission(permission);
            }
        });
    }

    private performDeletePermission(permission: Permission): void {
        // Mock delete işlemi
        const index = this.permissions.findIndex(p => p.id === permission.id);
        if (index > -1) {
            this.permissions[index].isActive = false;
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: `${permission.name} izni başarıyla pasif hale getirildi`
        });
    }

    addPermission(): void {
        // Mock add işlemi
        this.messageService.add({
            severity: 'info',
            summary: 'Bilgi',
            detail: 'Yeni izin ekleme özelliği yakında eklenecek'
        });
    }

    goToMatrix(): void {
        this.router.navigate(['/admin/role-permissions']);
    }
}
