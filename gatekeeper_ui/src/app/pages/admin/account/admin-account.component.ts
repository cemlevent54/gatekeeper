import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-admin-account',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        FileUploadModule,
        ToastModule,
        ConfirmDialogModule
    ],
    template: `
    <div class="admin-account-container">
      <div class="page-header">
        <h1>Hesap Bilgilerim</h1>
        <p class="page-subtitle">Admin hesap bilgilerinizi yönetin</p>
      </div>

      <div class="account-content">
        <!-- Profil Resmi Bölümü -->
        <div class="profile-section">
          <div class="profile-avatar">
            <div class="avatar-container">
              <img 
                [src]="profileImage || 'https://via.placeholder.com/120x120/16a34a/ffffff?text=A'" 
                alt="Admin Profil Resmi" 
                class="avatar-image"
              />
              <div class="avatar-overlay">
                <i class="pi pi-camera"></i>
              </div>
            </div>
            <p-fileUpload 
              mode="basic" 
              name="profile-image" 
              accept="image/*" 
              maxFileSize="5000000" 
              chooseLabel="Resim Seç"
              chooseIcon="pi pi-upload"
              (onSelect)="onImageSelect($event)"
              styleClass="avatar-upload"
            ></p-fileUpload>
          </div>
        </div>

        <!-- Kişisel Bilgiler Formu -->
        <div class="form-section">
          <h2>Admin Bilgileri</h2>
          <form class="account-form">
            <div class="form-row">
              <div class="field">
                <label for="username">Kullanıcı Adı</label>
                <input 
                  pInputText 
                  id="username" 
                  [(ngModel)]="userData.username" 
                  name="username"
                  placeholder="Admin kullanıcı adı"
                />
              </div>
              <div class="field">
                <label for="email">E-posta</label>
                <input 
                  pInputText 
                  id="email" 
                  type="email"
                  [(ngModel)]="userData.email" 
                  name="email"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="field">
                <label for="firstName">Ad</label>
                <input 
                  pInputText 
                  id="firstName" 
                  [(ngModel)]="userData.firstName" 
                  name="firstName"
                  placeholder="Adınız"
                />
              </div>
              <div class="field">
                <label for="lastName">Soyad</label>
                <input 
                  pInputText 
                  id="lastName" 
                  [(ngModel)]="userData.lastName" 
                  name="lastName"
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="field">
                <label for="role">Rol</label>
                <input 
                  pInputText 
                  id="role" 
                  [(ngModel)]="userData.role" 
                  name="role"
                  placeholder="Admin"
                  readonly
                />
              </div>
              <div class="field">
                <label for="lastLogin">Son Giriş</label>
                <input 
                  pInputText 
                  id="lastLogin" 
                  [(ngModel)]="userData.lastLogin" 
                  name="lastLogin"
                  placeholder="Son giriş tarihi"
                  readonly
                />
              </div>
            </div>

            <div class="form-actions">
              <button 
                pButton 
                type="button" 
                label="Bilgilerimi Güncelle" 
                icon="pi pi-save"
                class="update-btn"
                (click)="updateProfile()"
                [disabled]="isUpdating"
              ></button>
            </div>
          </form>
        </div>

        <!-- Güvenlik Bölümü -->
        <div class="security-section">
          <h2>Güvenlik Ayarları</h2>
          <div class="security-actions">
            <button 
              pButton 
              type="button" 
              label="Şifremi Değiştir" 
              icon="pi pi-key"
              class="p-button-outlined change-password-btn"
              (click)="showChangePassword = true"
            ></button>
            
            <button 
              pButton 
              type="button" 
              label="Hesabımı Sil" 
              icon="pi pi-trash"
              class="p-button-danger delete-account-btn"
              (click)="confirmDeleteAccount()"
            ></button>
          </div>
        </div>

        <!-- Admin İstatistikleri -->
        <div class="stats-section">
          <h2>Admin İstatistikleri</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="pi pi-users"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">1,234</div>
                <div class="stat-label">Toplam Kullanıcı</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="pi pi-file-edit"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">567</div>
                <div class="stat-label">Düzenlenen İçerik</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="pi pi-chart-bar"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">89</div>
                <div class="stat-label">Oluşturulan Rapor</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Şifre Değiştirme Modal -->
    <div class="modal-overlay" *ngIf="showChangePassword" (click)="closeChangePassword()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Şifre Değiştir</h3>
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="p-button-text close-btn"
            (click)="closeChangePassword()"
          ></button>
        </div>
        
        <form class="password-form">
          <div class="field">
            <label for="currentPassword">Mevcut Şifre</label>
            <input 
              pInputText 
              id="currentPassword" 
              type="password"
              [(ngModel)]="passwordData.currentPassword" 
              name="currentPassword"
              placeholder="Mevcut şifrenizi girin"
            />
          </div>
          
          <div class="field">
            <label for="newPassword">Yeni Şifre</label>
            <input 
              pInputText 
              id="newPassword" 
              type="password"
              [(ngModel)]="passwordData.newPassword" 
              name="newPassword"
              placeholder="Yeni şifrenizi girin"
            />
          </div>
          
          <div class="field">
            <label for="confirmPassword">Şifre Onayı</label>
            <input 
              pInputText 
              id="confirmPassword" 
              type="password"
              [(ngModel)]="passwordData.confirmPassword" 
              name="confirmPassword"
              placeholder="Yeni şifrenizi tekrar girin"
            />
          </div>
          
          <div class="modal-actions">
            <button 
              pButton 
              type="button" 
              label="İptal" 
              class="p-button-text"
              (click)="closeChangePassword()"
            ></button>
            <button 
              pButton 
              type="button" 
              label="Şifreyi Güncelle" 
              icon="pi pi-save"
              (click)="changePassword()"
              [disabled]="isChangingPassword"
            ></button>
          </div>
        </form>
      </div>
    </div>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
    styles: [`
    .admin-account-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
      color: #fff;
    }

    .page-subtitle {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
    }

    .account-content {
      display: grid;
      gap: 2rem;
    }

    .profile-section {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(6px);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
    }

    .profile-avatar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .avatar-container {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(255, 255, 255, 0.1);
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
      cursor: pointer;
    }

    .avatar-container:hover .avatar-overlay {
      opacity: 1;
    }

    .avatar-overlay i {
      font-size: 1.5rem;
      color: #fff;
    }

    .form-section, .security-section, .stats-section {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(6px);
      border-radius: 12px;
      padding: 2rem;
    }

    .form-section h2, .security-section h2, .stats-section h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
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

    .form-actions {
      margin-top: 2rem;
      text-align: center;
    }

    .update-btn {
      min-width: 200px;
    }

    .security-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .change-password-btn, .delete-account-btn {
      flex: 1;
      min-width: 150px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(22, 163, 74, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon i {
      font-size: 1.5rem;
      color: #16a34a;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
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

    .password-form {
      padding: 1.5rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    /* Toast responsive stilleri */
    :host ::ng-deep .p-toast {
      width: 90vw !important;
      max-width: 400px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      margin: 0 !important;
    }
    
    :host ::ng-deep .p-toast .p-toast-message {
      margin: 0.5rem 0 !important;
      border-radius: 8px !important;
      font-size: 0.875rem !important;
    }
    
    :host ::ng-deep .p-toast .p-toast-message-content {
      padding: 0.75rem 1rem !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .security-actions {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .modal-content {
        margin: 1rem;
      }

      .modal-actions {
        flex-direction: column;
      }

      :host ::ng-deep .p-toast {
        width: 95vw !important;
        max-width: 350px !important;
      }
      
      :host ::ng-deep .p-toast .p-toast-message {
        font-size: 0.8rem !important;
      }
      
      :host ::ng-deep .p-toast .p-toast-message-content {
        padding: 0.6rem 0.8rem !important;
      }
    }

    @media (max-width: 480px) {
      :host ::ng-deep .p-toast {
        width: 98vw !important;
        max-width: 320px !important;
      }
      
      :host ::ng-deep .p-toast .p-toast-message {
        font-size: 0.75rem !important;
      }
    }
  `]
})
export class AdminAccountComponent implements OnInit {
    userData = {
        username: 'admin',
        email: 'admin@gatekeeper.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'Super Admin',
        lastLogin: '2024-01-15 14:30'
    };

    passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    profileImage: string | null = null;
    showChangePassword = false;
    isUpdating = false;
    isChangingPassword = false;

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadAdminData();
    }

    private loadAdminData(): void {
        // Mock admin verilerini yükle
        console.log('Admin verileri yüklendi:', this.userData);
    }

    onImageSelect(event: any): void {
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.profileImage = e.target.result;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: 'Admin profil resmi güncellendi'
                });
            };
            reader.readAsDataURL(file);
        }
    }

    updateProfile(): void {
        this.isUpdating = true;

        // Mock güncelleme işlemi
        setTimeout(() => {
            this.isUpdating = false;
            this.messageService.add({
                severity: 'success',
                summary: 'Başarılı',
                detail: 'Admin profil bilgileri güncellendi'
            });
        }, 1000);
    }

    changePassword(): void {
        if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'Tüm alanları doldurun'
            });
            return;
        }

        if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'Yeni şifreler eşleşmiyor'
            });
            return;
        }

        this.isChangingPassword = true;

        // Mock şifre değiştirme işlemi
        setTimeout(() => {
            this.isChangingPassword = false;
            this.closeChangePassword();
            this.messageService.add({
                severity: 'success',
                summary: 'Başarılı',
                detail: 'Admin şifresi başarıyla değiştirildi'
            });
        }, 1000);
    }

    closeChangePassword(): void {
        this.showChangePassword = false;
        this.passwordData = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
    }

    confirmDeleteAccount(): void {
        this.confirmationService.confirm({
            message: 'Admin hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm admin yetkilerinizi kaybedeceksiniz.',
            header: 'Admin Hesap Silme Onayı',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Evet, Sil',
            rejectLabel: 'İptal',
            accept: () => {
                this.deleteAccount();
            }
        });
    }

    private deleteAccount(): void {
        // Mock admin hesap silme işlemi
        this.messageService.add({
            severity: 'warn',
            summary: 'Admin Hesabı Silindi',
            detail: 'Admin hesabınız başarıyla silindi'
        });

        // Gerçek uygulamada logout yapın
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('jwt');
                window.location.href = '/login';
            }
        }, 2000);
    }
}
