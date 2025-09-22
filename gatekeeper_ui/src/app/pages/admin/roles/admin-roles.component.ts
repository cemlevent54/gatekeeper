import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataTableComponent, DataTableColumn, DataTableAction } from '../../../../components/common/datatable.component';
import { UnauthorizedModalComponent } from '../../../shared/alerts/unauthorizedModal.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RolesService, Role, CreateRoleDto, UpdateRoleDto } from '../../../services/roles.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    UnauthorizedModalComponent
  ],
  template: `
    <div class="admin-roles-container">
      <!-- Page Header with Actions -->
      <div class="page-header">
        <div class="header-actions">
          <button 
            pButton 
            type="button" 
            label="Yetki Yönetimi" 
            icon="pi pi-shield"
            class="p-button-info"
            (click)="goToPermissions()"
          ></button>
          <button 
            pButton 
            type="button" 
            label="Yeni Rol Ekle" 
            icon="pi pi-plus"
            class="p-button-success"
            (click)="openAddModal()"
          ></button>
        </div>
      </div>

      <app-datatable
        [data]="roles"
        [columns]="columns"
        [actions]="actions"
        [title]="'Rol Yönetimi'"
        [subtitle]="'Sistemdeki tüm rolleri görüntüleyin ve yönetin'"
        [showSearch]="true"
        [paginator]="true"
        [rows]="10"
        [loading]="loading"
        (actionClick)="onActionClick($event)"
      ></app-datatable>
    </div>

    <!-- Edit Role Modal -->
    <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Rol Düzenle</h3>
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="p-button-text close-btn"
            (click)="closeEditModal()"
          ></button>
        </div>
        
        <form class="edit-form" *ngIf="editingRole">
          <div class="form-row">
            <div class="field">
              <label for="editName">Rol Adı</label>
              <input 
                pInputText 
                id="editName" 
                [(ngModel)]="editingRole.name" 
                name="editName"
                placeholder="Rol adı"
              />
            </div>
            <div class="field">
              <label for="editDescription">Açıklama</label>
              <input 
                pInputText 
                id="editDescription" 
                [(ngModel)]="editingRole.description" 
                name="editDescription"
                placeholder="Rol açıklaması"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label for="editIsActive">Durum</label>
              <p-select 
                id="editIsActive" 
                [(ngModel)]="editingRole.isActive" 
                name="editIsActive"
                [options]="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Durum seçin"
                class="custom-select"
              ></p-select>
            </div>
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
              type="button" 
              label="Güncelle" 
              icon="pi pi-save"
              (click)="updateRole()"
              [disabled]="isUpdating"
            ></button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Role Modal -->
    <div class="modal-overlay" *ngIf="showAddModal" (click)="closeAddModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Yeni Rol Ekle</h3>
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="p-button-text close-btn"
            (click)="closeAddModal()"
          ></button>
        </div>
        
        <form class="add-form">
          <div class="field">
            <label for="newRoleName">Rol Adı</label>
            <input 
              pInputText 
              id="newRoleName" 
              [(ngModel)]="newRoleName" 
              name="newRoleName"
              placeholder="Rol adını girin"
              class="full-width"
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
              type="button" 
              label="Ekle" 
              icon="pi pi-plus"
              (click)="addRole()"
              [disabled]="isAdding || !newRoleName?.trim()"
            ></button>
          </div>
        </form>
      </div>
    </div>

    <app-unauthorized-modal [(visible)]="showUnauthorizedModal" [message]="unauthorizedMessage"></app-unauthorized-modal>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .admin-roles-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem;
    }

    .page-header {
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .header-actions button {
      min-width: auto !important;
      white-space: nowrap;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .header-actions button {
        width: 100%;
        min-width: 200px !important;
      }
    }

    @media (max-width: 480px) {
      .header-actions button {
        min-width: 150px !important;
      }
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
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
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

    .edit-form, .add-form {
      padding: 1.5rem;
    }

    .add-form .field {
      margin-bottom: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
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

    :host ::ng-deep .p-inputtext[readonly] {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.6);
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    /* Unauthorized modal */
    .modal-body.unauthorized {
      padding: 1.5rem;
      text-align: center;
    }
    .modal-body.unauthorized i {
      font-size: 2rem;
      color: #ef4444;
      margin-bottom: 0.75rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .admin-roles-container {
        padding: 0.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-content {
        margin: 1rem;
      }

      .modal-actions {
        flex-direction: column;
      }
    }

    /* Custom Select Styles */
    :host ::ng-deep .custom-select {
      .p-select {
        background: rgba(0, 0, 0, 0.8) !important;
        border: 1px solid rgba(34, 197, 94, 0.3) !important;
        color: #22c55e !important;
        border-radius: 6px;
        width: 100%;
      }
      
      .p-select:not(.p-disabled):hover {
        border-color: rgba(34, 197, 94, 0.5) !important;
      }
      
      .p-select:not(.p-disabled).p-focus {
        border-color: #22c55e !important;
        box-shadow: 0 0 0 0.2rem rgba(34, 197, 94, 0.25) !important;
      }
      
      .p-select-label {
        color: #22c55e !important;
        background: transparent !important;
      }
      
      .p-select-trigger {
        color: #22c55e !important;
      }
      
      .p-select-panel {
        background: rgba(0, 0, 0, 0.95) !important;
        border: 1px solid rgba(34, 197, 94, 0.3) !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      }
      
      .p-select-items {
        background: transparent !important;
      }
      
      .p-select-item {
        color: #22c55e !important;
        background: transparent !important;
      }
      
      .p-select-item:hover {
        background: rgba(34, 197, 94, 0.1) !important;
        color: #22c55e !important;
      }
      
      .p-select-item.p-highlight {
        background: rgba(34, 197, 94, 0.2) !important;
        color: #22c55e !important;
      }
    }
  `]
})
export class AdminRolesComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  showEditModal = false;
  showAddModal = false;
  editingRole: Role | null = null;
  isUpdating = false;
  isAdding = false;
  newRoleName = '';

  showUnauthorizedModal = false;
  unauthorizedMessage = 'Bu sayfayı görüntülemek için role.view yetkisi gerekir.';

  statusOptions = [
    { label: 'Aktif', value: true },
    { label: 'Pasif', value: false }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private rolesService: RolesService,
    private router: Router
  ) { }

  columns: DataTableColumn[] = [
    {
      field: 'name',
      header: 'Rol Adı',
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
      field: 'userCount',
      header: 'Kullanıcı Sayısı',
      sortable: true,
      filterable: false,
      type: 'text',
      width: '150px',
      align: 'center'
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
      tooltip: 'Rolü düzenle'
    },
    {
      label: 'Sil',
      icon: 'pi pi-trash',
      severity: 'danger',
      tooltip: 'Rolü sil',
      disabled: (rowData: Role) => rowData.userCount > 0
    }
  ];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    console.log('[AdminRolesComponent][loadRoles] Roller yükleniyor...');

    this.rolesService.getAllRoles().subscribe({
      next: (response) => {
        console.log('[AdminRolesComponent][loadRoles] API yanıtı:', response);
        if (response.success && response.data) {
          this.roles = response.data;
          console.log('[AdminRolesComponent][loadRoles] Roller yüklendi:', this.roles.length);
        } else {
          console.warn('[AdminRolesComponent][loadRoles] API başarısız:', response.message);
          this.roles = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('[AdminRolesComponent][loadRoles] Hata:', error);
        this.roles = [];
        this.loading = false;

        if (error.status === 401 || error.status === 403) {
          this.unauthorizedMessage = error?.error?.message || 'Bu sayfayı görüntülemek için role.view yetkisi gerekir.';
          this.showUnauthorizedModal = true;
          return;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Roller yüklenirken bir hata oluştu'
        });
      }
    });
  }

  onActionClick(event: { action: DataTableAction, rowData: Role, rowIndex: number }): void {
    const { action, rowData, rowIndex } = event;

    switch (action.label) {
      case 'Düzenle':
        this.editRole(rowData);
        break;
      case 'Sil':
        this.deleteRole(rowData);
        break;
      default:
        console.log('Bilinmeyen aksiyon:', action.label);
    }
  }

  private editRole(role: Role): void {
    console.log('[AdminRolesComponent][editRole] Rol düzenleniyor:', role);

    this.editingRole = { ...role }; // Deep copy
    this.showEditModal = true;
  }

  private deleteRole(role: Role): void {
    if (role.userCount > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Bu rolü kullanan kullanıcılar olduğu için silinemez!'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `"${role.name}" rolünü silmek istediğinizden emin misiniz?`,
      header: 'Rol Silme Onayı',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        this.performDeleteRole(role);
      }
    });
  }

  private performDeleteRole(role: Role): void {
    this.rolesService.deleteRole(role.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Listeden rolü kaldır
          const index = this.roles.findIndex(r => r.id === role.id);
          if (index > -1) {
            this.roles.splice(index, 1);
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: `${role.name} rolü başarıyla silindi`
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: 'Rol silinemedi: ' + response.message
          });
        }
      },
      error: (error) => {
        console.error('Rol silinirken hata:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Rol silinirken bir hata oluştu'
        });
      }
    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingRole = null;
    this.isUpdating = false;
  }

  openAddModal(): void {
    this.newRoleName = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newRoleName = '';
    this.isAdding = false;
  }

  updateRole(): void {
    if (!this.editingRole) return;

    this.isUpdating = true;

    const updateData: UpdateRoleDto = {
      name: this.editingRole.name,
      description: this.editingRole.description,
      isActive: this.editingRole.isActive
    };

    console.log('Güncellenecek veri:', updateData);

    this.rolesService.updateRole(this.editingRole.id, updateData).subscribe({
      next: (response) => {
        this.isUpdating = false;
        if (response.success && response.data) {
          // Listede rolü güncelle
          const index = this.roles.findIndex(r => r.id === this.editingRole!.id);
          if (index > -1) {
            this.roles[index] = response.data;
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: `${this.editingRole!.name} rolü başarıyla güncellendi`
          });

          this.closeEditModal();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: 'Rol güncellenemedi: ' + response.message
          });
        }
      },
      error: (error) => {
        this.isUpdating = false;
        console.error('Rol güncellenirken hata:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Rol güncellenirken bir hata oluştu'
        });
      }
    });
  }

  addRole(): void {
    if (!this.newRoleName?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Lütfen rol adını girin'
      });
      return;
    }

    this.isAdding = true;

    const newRole = {
      name: this.newRoleName.trim(),
      description: '',
      isActive: true
    };

    console.log('Yeni rol ekleniyor:', newRole);

    this.rolesService.createRole(newRole).subscribe({
      next: (response) => {
        this.isAdding = false;
        if (response.success && response.data) {
          // Listeye yeni rolü ekle
          this.roles.push(response.data);

          this.messageService.add({
            severity: 'success',
            summary: 'Başarılı',
            detail: `${newRole.name} rolü başarıyla eklendi`
          });

          this.closeAddModal();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Hata',
            detail: 'Rol eklenemedi: ' + (response.message || 'Bilinmeyen hata')
          });
        }
      },
      error: (error) => {
        this.isAdding = false;
        console.error('Rol eklenirken hata:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Rol eklenirken bir hata oluştu'
        });
      }
    });
  }

  goToPermissions(): void {
    this.router.navigate(['/admin/roles/permissions']);
  }
}
