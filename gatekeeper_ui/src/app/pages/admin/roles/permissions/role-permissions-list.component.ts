import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, DataTableColumn, DataTableAction } from '../../../../../components/common/datatable.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { PermissionsService, Permission } from '../../../../services/permissions.service';

// Permission interface'i service'den import ediliyor

@Component({
    selector: 'app-role-permissions-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DataTableComponent,
        ToastModule,
        ConfirmDialogModule,
        InputTextModule,
        ButtonModule
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

    <!-- Add Permission Modal -->
    <div class="modal-overlay" *ngIf="showAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Yeni İzin Ekle</h3>
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="p-button-text close-btn"
            (click)="closeAddModal()"
          ></button>
        </div>
        
        <form class="add-form" (ngSubmit)="createPermission()">
          <div class="field">
            <label for="addKey">İzin Anahtarı</label>
            <input 
              pInputText 
              id="addKey" 
              [(ngModel)]="newPermission.key" 
              name="addKey"
              placeholder="örn: user.create"
              required
            />
          </div>

          <div class="field">
            <label for="addDescription">Açıklama</label>
            <input 
              pInputText 
              id="addDescription" 
              [(ngModel)]="newPermission.description" 
              name="addDescription"
              placeholder="İzin açıklaması"
            />
          </div>
          
          <div class="modal-actions">
            <button 
              pButton 
              type="button" 
              label="İptal" 
              class="p-button-text"
              (click)="closeAddModal()"
            ></button>
            <button 
              pButton 
              type="submit" 
              label="Oluştur" 
              icon="pi pi-plus"
              [disabled]="isCreating || !newPermission.key?.trim()"
            ></button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Permission Modal -->
    <div class="modal-overlay" *ngIf="showEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>İzin Düzenle</h3>
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="p-button-text close-btn"
            (click)="closeEditModal()"
          ></button>
        </div>
        
        <form class="edit-form" (ngSubmit)="updatePermission()" *ngIf="editingPermission">
          <div class="field">
            <label for="editKey">İzin Anahtarı</label>
            <input 
              pInputText 
              id="editKey" 
              [(ngModel)]="editingPermission.key" 
              name="editKey"
              placeholder="örn: user.create"
              required
            />
          </div>

          <div class="field">
            <label for="editDescription">Açıklama</label>
            <input 
              pInputText 
              id="editDescription" 
              [(ngModel)]="editingPermission.description" 
              name="editDescription"
              placeholder="İzin açıklaması"
            />
          </div>
          
          <div class="modal-actions">
            <button 
              pButton 
              type="button" 
              label="İptal" 
              class="p-button-text"
              (click)="closeEditModal()"
            ></button>
            <button 
              pButton 
              type="submit" 
              label="Güncelle" 
              icon="pi pi-save"
              [disabled]="isUpdating"
            ></button>
          </div>
        </form>
      </div>
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

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(6px);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #fff;
    }

    .close-btn {
      color: rgba(255, 255, 255, 0.7) !important;
    }

    .add-form, .edit-form {
      padding: 1.5rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .field label {
      font-size: 0.875rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }

    :host ::ng-deep .p-inputtext {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    :host ::ng-deep .p-inputtext:focus {
      border-color: #16a34a;
      box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .permissions-container {
        padding: 0.5rem;
      }

      .modal-content {
        margin: 1rem;
      }

      .modal-actions {
        flex-direction: column;
      }
    }
    `]
})
export class RolePermissionsListComponent implements OnInit {
    permissions: Permission[] = [];
    loading = false;

    // Modal states
    showAddModal = false;
    showEditModal = false;
    isCreating = false;
    isUpdating = false;

    // Form data
    newPermission = {
        key: '',
        description: ''
    };
    editingPermission: Permission | null = null;

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private permissionsService: PermissionsService
    ) { }

    columns: DataTableColumn[] = [
        {
            field: 'key',
            header: 'İzin Anahtarı',
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

        this.permissionsService.getAllPermissions().subscribe({
            next: (response) => {
                this.loading = false;
                if (response.success && response.data) {
                    this.permissions = response.data;
                    console.log('[RolePermissionsListComponent][loadPermissions] İzinler yüklendi:', this.permissions.length);
                } else {
                    console.error('[RolePermissionsListComponent][loadPermissions] API başarısız:', response);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Hata',
                        detail: 'İzinler yüklenirken bir hata oluştu'
                    });
                }
            },
            error: (error) => {
                this.loading = false;
                console.error('[RolePermissionsListComponent][loadPermissions] Hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'İzinler yüklenirken bir hata oluştu'
                });
            }
        });
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

        this.editingPermission = { ...permission };
        this.showEditModal = true;
    }

    private deletePermission(permission: Permission): void {
        this.confirmationService.confirm({
            message: `"${permission.key}" iznini pasif hale getirmek istediğinizden emin misiniz?`,
            header: 'İzin Pasifleştirme Onayı',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Evet',
            rejectLabel: 'Hayır',
            accept: () => {
                this.performDeletePermission(permission);
            }
        });
    }

    private performDeletePermission(permission: Permission): void {
        // İzni pasif hale getir (soft delete)
        this.permissionsService.updatePermission(permission.id, {
            isActive: false
        }).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    // Listede güncelle
                    const index = this.permissions.findIndex(p => p.id === permission.id);
                    if (index > -1) {
                        this.permissions[index] = response.data;
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: `${permission.key} izni başarıyla pasif hale getirildi`
                    });
                }
            },
            error: (error) => {
                console.error('İzin pasifleştirilirken hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'İzin pasifleştirilirken bir hata oluştu'
                });
            }
        });
    }

    addPermission(): void {
        this.newPermission = { key: '', description: '' };
        this.showAddModal = true;
    }

    goToMatrix(): void {
        this.router.navigate(['/admin/role-permissions']);
    }

    // Modal methods
    closeAddModal(): void {
        this.showAddModal = false;
        this.newPermission = { key: '', description: '' };
        this.isCreating = false;
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.editingPermission = null;
        this.isUpdating = false;
    }

    createPermission(): void {
        if (!this.newPermission.key?.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Uyarı',
                detail: 'İzin anahtarı gereklidir'
            });
            return;
        }

        this.isCreating = true;

        this.permissionsService.createPermission({
            key: this.newPermission.key.trim(),
            description: this.newPermission.description?.trim() || '',
            isActive: true
        }).subscribe({
            next: (response) => {
                this.isCreating = false;
                if (response.success && response.data) {
                    // Listeye yeni izni ekle
                    this.permissions.unshift(response.data);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: 'Yeni izin başarıyla oluşturuldu'
                    });

                    this.closeAddModal();
                }
            },
            error: (error) => {
                this.isCreating = false;
                console.error('İzin oluşturulurken hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'İzin oluşturulurken bir hata oluştu'
                });
            }
        });
    }

    updatePermission(): void {
        if (!this.editingPermission) return;

        this.isUpdating = true;

        this.permissionsService.updatePermission(this.editingPermission.id, {
            key: this.editingPermission.key,
            description: this.editingPermission.description
        }).subscribe({
            next: (response) => {
                this.isUpdating = false;
                if (response.success && response.data) {
                    // Listede güncelle
                    const index = this.permissions.findIndex(p => p.id === this.editingPermission!.id);
                    if (index > -1) {
                        this.permissions[index] = response.data;
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: 'İzin başarıyla güncellendi'
                    });

                    this.closeEditModal();
                }
            },
            error: (error) => {
                this.isUpdating = false;
                console.error('İzin güncellenirken hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'İzin güncellenirken bir hata oluştu'
                });
            }
        });
    }
}
