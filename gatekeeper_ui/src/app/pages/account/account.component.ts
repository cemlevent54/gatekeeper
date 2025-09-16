import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService, User, UpdateUserRequest } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-user-account',
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
    <div class="user-account-container">
      <div class="page-header">
        <h1>Hesabım</h1>
        <p class="page-subtitle">Kendi hesap bilgilerinizi yönetin</p>
      </div>

      <div class="account-content">
        <!-- Profil Resmi Bölümü -->
        <div class="profile-section">
          <div class="profile-avatar">
            <div class="avatar-container">
              <img 
                [src]="userData.profileImage ? (userData.profileImage.startsWith('http') ? userData.profileImage : 'http://localhost:3000' + userData.profileImage) : (profileImage || 'https://via.placeholder.com/120x120/2563eb/ffffff?text=U')" 
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
          <h2>Kişisel Bilgilerim</h2>
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
                  placeholder="kullanici@example.com"
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

        <!-- Kullanıcı İstatistikleri -->
        <div class="stats-section">
          <h2>Hesap İstatistikleri</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ userData.createdAt ? (userData.createdAt | date:'dd/MM/yyyy') : '-' }}</div>
                <div class="stat-label">Kayıt Tarihi</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="pi pi-clock"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ userData.lastLoginAt ? (userData.lastLoginAt | date:'dd/MM/yyyy') : '-' }}</div>
                <div class="stat-label">Son Giriş</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ userData.verifiedAt ? 'Doğrulandı' : 'Beklemede' }}</div>
                <div class="stat-label">E-posta Durumu</div>
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
        
        <div class="password-form">
          <div class="info-message">
            <i class="pi pi-info-circle"></i>
            <p>Şifrenizi değiştirmek için e-posta adresinize bir şifre sıfırlama linki göndereceğiz.</p>
            <p><strong>E-posta:</strong> {{ userData.email }}</p>
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
              [label]="isChangingPassword ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'" 
              icon="pi pi-send"
              (click)="changePassword()"
              [disabled]="isChangingPassword"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
    styles: [`
    .user-account-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 1rem;
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
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
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
      background: rgba(37, 99, 235, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon i {
      font-size: 1.5rem;
      color: #2563eb;
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

    .info-message {
      background: rgba(37, 99, 235, 0.1);
      border: 1px solid rgba(37, 99, 235, 0.2);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-message i {
      color: #2563eb;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }

    .info-message p {
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .info-message p strong {
      color: #2563eb;
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
export class UserAccountComponent implements OnInit {
    userData: User = {
        id: '',
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        isActive: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    profileImage: string | null = null;
    isUpdating = false;
    showChangePassword = false;
    isChangingPassword = false;

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private userService: UserService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadUserData();
    }

    private loadUserData(): void {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.id) {
            this.userService.getUserById(currentUser.id).subscribe({
                next: (response) => {
                    if (response.success && response.data) {
                        this.userData = response.data;
                        console.log('Kullanıcı verileri yüklendi:', this.userData);
                    }
                },
                error: (error) => {
                    console.error('Kullanıcı verileri yüklenirken hata:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Hata',
                        detail: 'Kullanıcı verileri yüklenirken bir hata oluştu'
                    });
                }
            });
        } else {
            console.error('Kullanıcı bilgisi bulunamadı');
            this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.'
            });
        }
    }

    onImageSelect(event: any): void {
        const file = event.files[0];
        if (file) {
            // Dosya boyutu kontrolü (5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Dosya boyutu 5MB\'dan büyük olamaz'
                });
                return;
            }

            // Dosya tipi kontrolü
            if (!file.type.match(/\/(jpg|jpeg|png|gif)$/)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Sadece resim dosyaları kabul edilir (jpg, jpeg, png, gif)'
                });
                return;
            }

            // FormData ile dosyayı backend'e gönder
            this.uploadProfileImage(file);
        }
    }

    private uploadProfileImage(file: File): void {
        if (!this.userData.id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'Kullanıcı ID bulunamadı'
            });
            return;
        }

        this.userService.uploadAvatar(this.userData.id, file).subscribe({
            next: (response) => {
                if (response.success && response.data) {
                    this.userData.profileImage = response.data.fileUrl;
                    this.profileImage = response.data.fileUrl;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: 'Profil resmi başarıyla yüklendi'
                    });
                }
            },
            error: (error) => {
                console.error('Profil resmi yüklenirken hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Profil resmi yüklenirken bir hata oluştu'
                });
            }
        });
    }

    updateProfile(): void {
        if (!this.userData.id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'Kullanıcı ID bulunamadı'
            });
            return;
        }

        this.isUpdating = true;

        const updateData: UpdateUserRequest = {
            firstName: this.userData.firstName,
            lastName: this.userData.lastName,
            email: this.userData.email
        };

        this.userService.updateUser(this.userData.id, updateData).subscribe({
            next: (response) => {
                this.isUpdating = false;
                if (response.success && response.data) {
                    this.userData = response.data;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: 'Profil bilgileriniz güncellendi'
                    });
                }
            },
            error: (error) => {
                this.isUpdating = false;
                console.error('Profil güncellenirken hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Profil güncellenirken bir hata oluştu'
                });
            }
        });
    }

    changePassword(): void {
        if (!this.userData.email) {
            this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'E-posta adresi bulunamadı'
            });
            return;
        }

        this.isChangingPassword = true;

        // Şifre sıfırlama email'i gönder
        this.authService.forgotPassword(this.userData.email).subscribe({
            next: (response) => {
                this.isChangingPassword = false;
                this.closeChangePassword();
                if (response.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: 'Şifre sıfırlama linki e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.'
                    });
                }
            },
            error: (error) => {
                this.isChangingPassword = false;
                console.error('Şifre sıfırlama isteği hatası:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Şifre sıfırlama isteği gönderilemedi'
                });
            }
        });
    }

    closeChangePassword(): void {
        this.showChangePassword = false;
    }

    confirmDeleteAccount(): void {
        this.confirmationService.confirm({
            message: 'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verilerinizi kaybedeceksiniz.',
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
        if (!this.userData.id) {
            this.messageService.add({
                severity: 'error',
                summary: 'Hata',
                detail: 'Kullanıcı ID bulunamadı'
            });
            return;
        }

        this.userService.deleteUser(this.userData.id).subscribe({
            next: (response) => {
                if (response.success) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Hesap Silindi',
                        detail: 'Hesabınız başarıyla silindi'
                    });

                    // Logout yap ve login sayfasına yönlendir
                    setTimeout(() => {
                        this.authService.clearTokens();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }
                    }, 2000);
                }
            },
            error: (error) => {
                console.error('Hesap silinirken hata:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Hesap silinirken bir hata oluştu'
                });
            }
        });
    }
}
