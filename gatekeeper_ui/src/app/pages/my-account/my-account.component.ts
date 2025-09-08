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
    selector: 'app-my-account',
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
    <section class="account-shell">
      <div class="account-container">
        <div class="account-header">
          <h1>Hesap Bilgilerim</h1>
          <p class="subtitle">Profil bilgilerinizi güncelleyin ve hesabınızı yönetin</p>
        </div>

        <div class="account-content">
          <!-- Profil Resmi Bölümü -->
          <div class="profile-section">
            <div class="profile-avatar">
              <div class="avatar-container">
                <img 
                  [src]="profileImage || 'https://via.placeholder.com/120x120/16a34a/ffffff?text=U'" 
                  alt="Profil Resmi" 
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
            <h2>Kişisel Bilgiler</h2>
            <form class="account-form">
              <div class="form-row">
                <div class="field">
                  <label for="username">Kullanıcı Adı</label>
                  <input 
                    pInputText 
                    id="username" 
                    [(ngModel)]="userData.username" 
                    name="username"
                    placeholder="Kullanıcı adınız"
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
                    placeholder="ornek@email.com"
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
            <h2>Güvenlik</h2>
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
        </div>
      </div>
    </section>

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
    .account-shell {
      min-height: calc(100dvh - 80px);
      padding: 2rem 1.5rem;
      background: #0a0a0a;
    }

    .account-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .account-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .account-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 600;
      color: #fff;
    }

    .subtitle {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.1rem;
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

    .form-section, .security-section {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(6px);
      border-radius: 12px;
      padding: 2rem;
    }

    .form-section h2, .security-section h2 {
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
      .account-shell {
        padding: 1rem;
      }

      .account-header h1 {
        font-size: 2rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .security-actions {
        flex-direction: column;
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
export class MyAccountComponent implements OnInit {
    userData = {
        username: 'cemleventavc',
        email: 'cemleventavc@gmail.com',
        firstName: 'Cem',
        lastName: 'Levent Avcı'
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
        // Mock kullanıcı verilerini yükle
        this.loadUserData();
    }

    private loadUserData(): void {
        // Gerçek uygulamada API'den kullanıcı verilerini yükleyin
        console.log('Kullanıcı verileri yüklendi:', this.userData);
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
                    detail: 'Profil resmi güncellendi'
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
                detail: 'Profil bilgileriniz güncellendi'
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
                detail: 'Şifreniz başarıyla değiştirildi'
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
            message: 'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            header: 'Hesap Silme Onayı',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Evet, Sil',
            rejectLabel: 'İptal',
            accept: () => {
                this.deleteAccount();
            }
        });
    }

    private deleteAccount(): void {
        // Mock hesap silme işlemi
        this.messageService.add({
            severity: 'warn',
            summary: 'Hesap Silindi',
            detail: 'Hesabınız başarıyla silindi'
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
