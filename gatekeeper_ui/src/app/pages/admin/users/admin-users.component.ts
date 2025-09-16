import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, DataTableColumn, DataTableAction } from '../../../../components/common/datatable.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService, User } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { RolesService, Role } from '../../../services/roles.service';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DataTableComponent,
        ToastModule,
        ConfirmDialogModule,
        InputTextModule,
        ButtonModule,
        SelectModule
    ],
    template: `
    <div class="admin-users-container">
      <app-datatable
        [data]="users"
        [columns]="columns"
        [actions]="actions"
        [title]="'Kullanıcı Yönetimi'"
        [subtitle]="'Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin'"
        [showSearch]="true"
        [paginator]="true"
        [rows]="10"
        [loading]="loading"
        (actionClick)="onActionClick($event)"
      ></app-datatable>
    </div>

    <!-- Edit User Modal -->
    <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Kullanıcı Düzenle</h3>
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="p-button-text close-btn"
            (click)="closeEditModal()"
          ></button>
        </div>
        
        <form class="edit-form" *ngIf="editingUser">
          <div class="form-row">
            <div class="field">
              <label for="editUsername">Kullanıcı Adı</label>
              <input 
                pInputText 
                id="editUsername" 
                [(ngModel)]="editingUser.username" 
                name="editUsername"
                placeholder="Kullanıcı adı"
              />
            </div>
            <div class="field">
              <label for="editEmail">E-posta</label>
              <input 
                pInputText 
                id="editEmail" 
                type="email"
                [(ngModel)]="editingUser.email" 
                name="editEmail"
                placeholder="E-posta adresi"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label for="editFirstName">Ad</label>
              <input 
                pInputText 
                id="editFirstName" 
                [(ngModel)]="editingUser.firstName" 
                name="editFirstName"
                placeholder="Ad"
              />
            </div>
            <div class="field">
              <label for="editLastName">Soyad</label>
              <input 
                pInputText 
                id="editLastName" 
                [(ngModel)]="editingUser.lastName" 
                name="editLastName"
                placeholder="Soyad"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label for="editRole">Rol</label>
              <p-select 
                id="editRole" 
                [(ngModel)]="editingUser.role" 
                name="editRole"
                [options]="roleOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Rol seçin"
                class="custom-select"
              ></p-select>
            </div>
            <div class="field">
              <label for="editIsActive">Durum</label>
              <p-select 
                id="editIsActive" 
                [(ngModel)]="editingUser.isActive" 
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
              (click)="updateUser()"
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
    .admin-users-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem;
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

    .edit-form {
      padding: 1.5rem;
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

    .status-select {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 0.75rem;
      border-radius: 6px;
    }

    .status-select:focus {
      border-color: #16a34a;
      box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
      outline: none;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .admin-users-container {
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
export class AdminUsersComponent implements OnInit {
    users: User[] = [];
    roles: Role[] = [];
    loading = false;
    showEditModal = false;
    editingUser: User | null = null;
    isUpdating = false;

    statusOptions = [
        { label: 'Aktif', value: true },
        { label: 'Pasif', value: false }
    ];

    roleOptions: { label: string; value: string }[] = [];

    columns: DataTableColumn[] = [
        {
            field: 'username',
            header: 'Kullanıcı Adı',
            sortable: true,
            filterable: true,
            type: 'text',
            width: '150px'
        },
        {
            field: 'email',
            header: 'E-posta',
            sortable: true,
            filterable: true,
            type: 'text',
            width: '200px'
        },
        {
            field: 'firstName',
            header: 'Ad',
            sortable: true,
            filterable: true,
            type: 'text',
            width: '120px'
        },
        {
            field: 'lastName',
            header: 'Soyad',
            sortable: true,
            filterable: true,
            type: 'text',
            width: '120px'
        },
        {
            field: 'role',
            header: 'Rol',
            sortable: true,
            filterable: true,
            type: 'text',
            width: '100px'
        },
        {
            field: 'isActive',
            header: 'Durum',
            sortable: true,
            type: 'status',
            width: '100px',
            align: 'center'
        },
        {
            field: 'lastLoginAt',
            header: 'Son Giriş',
            sortable: true,
            type: 'date',
            width: '150px'
        },
        {
            field: 'createdAt',
            header: 'Kayıt Tarihi',
            sortable: true,
            type: 'date',
            width: '150px'
        },
        {
            field: 'actions',
            header: 'İşlemler',
            type: 'actions',
            width: '150px',
            align: 'center'
        }
    ];

    actions: DataTableAction[] = [
        {
            label: 'Görüntüle',
            icon: 'pi pi-eye',
            severity: 'info',
            tooltip: 'Kullanıcı detaylarını görüntüle',
            visible: (rowData: User) => true // Her zaman görünür
        },
        {
            label: 'Düzenle',
            icon: 'pi pi-pencil',
            severity: 'primary',
            tooltip: 'Kullanıcıyı düzenle',
            visible: (rowData: User) => {
                // Sadece admin kullanıcılar düzenleyebilir
                return rowData.role === 'admin' || rowData.role === 'user';
            }
        },
        {
            label: 'Sil',
            icon: 'pi pi-trash',
            severity: 'danger',
            tooltip: 'Kullanıcıyı sil',
            visible: (rowData: User) => {
                // Kendi hesabını silemez
                const currentUser = this.getCurrentUser();
                if (!currentUser) return false;

                // Kendi hesabını silemez
                return currentUser.id !== rowData.id;
            }
        }
    ];

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private userService: UserService,
        private authService: AuthService,
        private rolesService: RolesService
    ) { }

    ngOnInit(): void {
        this.loadUsers();
        this.loadRoles();
    }

    private getCurrentUser(): any {
        return this.authService.getCurrentUser();
    }

    private loadUsers(): void {
        this.loading = true;

        this.userService.getAllUsers().subscribe({
            next: (response) => {
                this.loading = false;
                if (response.success && response.data) {
                    this.users = response.data;
                    console.log('Kullanıcılar yüklendi:', this.users);
                    console.log('İlk kullanıcı detayı:', this.users[0]);
                }
            },
            error: (error) => {
                this.loading = false;
                console.error('Kullanıcılar yüklenirken hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Kullanıcılar yüklenirken bir hata oluştu'
                });
            }
        });
    }

    private loadRoles(): void {
        console.log('loadRoles çağrıldı');
        this.rolesService.getAllRoles().subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.roles = response.data;
                    // Role options'ı güncelle
                    // isActive undefined ise true kabul et (eski roller için)
                    this.roleOptions = this.roles
                        .filter(role => {
                            const isActive = role.isActive !== false; // undefined veya true ise aktif
                            const notDeleted = !role.isDeleted;
                            console.log(`Role ${role.name}: isActive=${role.isActive}, isDeleted=${role.isDeleted}, filtered=${isActive && notDeleted}`);
                            return isActive && notDeleted;
                        })
                        .map(role => ({
                            label: role.name,
                            value: role.id
                        }));
                    console.log('Roller yüklendi:', this.roles);
                    console.log('Role options:', this.roleOptions);
                    console.log('Role options length:', this.roleOptions.length);
                } else {
                    console.log('Roles API başarısız veya data yok:', response);
                }
            },
            error: (error) => {
                console.error('Roller yüklenirken hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Roller yüklenirken bir hata oluştu'
                });
            }
        });
    }


    onActionClick(event: { action: DataTableAction, rowData: User, rowIndex: number }): void {
        const { action, rowData, rowIndex } = event;

        switch (action.label) {
            case 'Görüntüle':
                this.viewUser(rowData);
                break;
            case 'Düzenle':
                this.editUser(rowData);
                break;
            case 'Sil':
                this.deleteUser(rowData);
                break;
        }
    }

    private viewUser(user: User): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Kullanıcı Detayları',
            detail: `${user.username} kullanıcısının detayları görüntüleniyor...`
        });

        // TODO: Kullanıcı detay modal'ı açılacak
        console.log('View user:', user);
    }

    private editUser(user: User): void {
        console.log('editUser çağrıldı:', user);
        console.log('Mevcut roller:', this.roles);
        console.log('Role options:', this.roleOptions);

        this.editingUser = { ...user }; // Deep copy

        // Kullanıcının mevcut rolünün ID'sini bul ve set et
        if (user.role) {
            const currentRole = this.roles.find(role => role.name === user.role);
            console.log('Kullanıcının mevcut rolü:', user.role);
            console.log('Bulunan rol:', currentRole);
            if (currentRole) {
                this.editingUser.role = currentRole.id;
                console.log('Editing user role set edildi:', this.editingUser.role);
            }
        }

        this.showEditModal = true;
    }


    private deleteUser(user: User): void {
        this.confirmationService.confirm({
            message: `"${user.username}" kullanıcısını silmek istediğinizden emin misiniz?`,
            header: 'Kullanıcı Silme Onayı',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Evet',
            rejectLabel: 'Hayır',
            accept: () => {
                this.performDeleteUser(user);
            }
        });
    }

    private performDeleteUser(user: User): void {
        this.userService.deleteUser(user.id).subscribe({
            next: (response) => {
                if (response.success) {
                    // Listeden kullanıcıyı kaldır
                    const index = this.users.findIndex(u => u.id === user.id);
                    if (index > -1) {
                        this.users.splice(index, 1);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: `${user.username} kullanıcısı başarıyla silindi`
                    });
                }
            },
            error: (error) => {
                console.error('Kullanıcı silinirken hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Kullanıcı silinirken bir hata oluştu'
                });
            }
        });
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.editingUser = null;
        this.isUpdating = false;
    }

    updateUser(): void {
        if (!this.editingUser) return;

        this.isUpdating = true;

        // Role ID'sini bul
        const selectedRole = this.roles.find(role => role.id === this.editingUser!.role);
        const roleName = selectedRole ? selectedRole.name : this.editingUser.role;

        const updateData = {
            firstName: this.editingUser.firstName,
            lastName: this.editingUser.lastName,
            email: this.editingUser.email,
            isActive: this.editingUser.isActive,
            role: roleName // Role name'i gönder (backend'de role ID'ye çevrilecek)
        };

        console.log('Güncellenecek veri:', updateData);
        console.log('Seçilen rol:', selectedRole);

        this.userService.updateUser(this.editingUser.id, updateData).subscribe({
            next: (response) => {
                this.isUpdating = false;
                if (response.success && response.data) {
                    // Listede kullanıcıyı güncelle
                    const index = this.users.findIndex(u => u.id === this.editingUser!.id);
                    if (index > -1) {
                        this.users[index] = response.data;
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: `${this.editingUser!.username} kullanıcısı başarıyla güncellendi`
                    });

                    this.closeEditModal();
                }
            },
            error: (error) => {
                this.isUpdating = false;
                console.error('Kullanıcı güncellenirken hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Kullanıcı güncellenirken bir hata oluştu'
                });
            }
        });
    }
}
