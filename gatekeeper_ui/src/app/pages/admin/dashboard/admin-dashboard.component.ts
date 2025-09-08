import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p class="subtitle">Sistem genel bakış ve yönetim paneli</p>
      </div>

      <div class="stats-grid">
        <p-card class="stat-card">
          <ng-template pTemplate="header">
            <div class="stat-header">
              <i class="pi pi-users stat-icon"></i>
              <h3>Toplam Kullanıcı</h3>
            </div>
          </ng-template>
          <div class="stat-content">
            <div class="stat-number">1,234</div>
            <div class="stat-change positive">+12% bu ay</div>
          </div>
        </p-card>

        <p-card class="stat-card">
          <ng-template pTemplate="header">
            <div class="stat-header">
              <i class="pi pi-eye stat-icon"></i>
              <h3>Sayfa Görüntüleme</h3>
            </div>
          </ng-template>
          <div class="stat-content">
            <div class="stat-number">45,678</div>
            <div class="stat-change positive">+8% bu hafta</div>
          </div>
        </p-card>

        <p-card class="stat-card">
          <ng-template pTemplate="header">
            <div class="stat-header">
              <i class="pi pi-shopping-cart stat-icon"></i>
              <h3>Satışlar</h3>
            </div>
          </ng-template>
          <div class="stat-content">
            <div class="stat-number">€12,345</div>
            <div class="stat-change negative">-3% bu ay</div>
          </div>
        </p-card>

        <p-card class="stat-card">
          <ng-template pTemplate="header">
            <div class="stat-header">
              <i class="pi pi-chart-line stat-icon"></i>
              <h3>Dönüşüm Oranı</h3>
            </div>
          </ng-template>
          <div class="stat-content">
            <div class="stat-number">3.2%</div>
            <div class="stat-change positive">+0.5% bu ay</div>
          </div>
        </p-card>
      </div>

      <div class="dashboard-content">
        <div class="content-grid">
          <p-card class="content-card">
            <ng-template pTemplate="header">
              <h3>Son Aktiviteler</h3>
            </ng-template>
            <div class="activity-list">
              <div class="activity-item">
                <i class="pi pi-user-plus activity-icon"></i>
                <div class="activity-content">
                  <div class="activity-title">Yeni kullanıcı kaydı</div>
                  <div class="activity-time">2 dakika önce</div>
                </div>
              </div>
              <div class="activity-item">
                <i class="pi pi-file-edit activity-icon"></i>
                <div class="activity-content">
                  <div class="activity-title">Blog yazısı güncellendi</div>
                  <div class="activity-time">15 dakika önce</div>
                </div>
              </div>
              <div class="activity-item">
                <i class="pi pi-envelope activity-icon"></i>
                <div class="activity-content">
                  <div class="activity-title">Email gönderildi</div>
                  <div class="activity-time">1 saat önce</div>
                </div>
              </div>
            </div>
          </p-card>

          <p-card class="content-card">
            <ng-template pTemplate="header">
              <h3>Hızlı İşlemler</h3>
            </ng-template>
            <div class="quick-actions">
              <button pButton type="button" label="Yeni Kullanıcı" icon="pi pi-user-plus" class="p-button-outlined"></button>
              <button pButton type="button" label="Blog Yazısı" icon="pi pi-file-edit" class="p-button-outlined"></button>
              <button pButton type="button" label="Email Gönder" icon="pi pi-envelope" class="p-button-outlined"></button>
              <button pButton type="button" label="Rapor Oluştur" icon="pi pi-chart-bar" class="p-button-outlined"></button>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
      color: #fff;
    }

    .subtitle {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.06) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      backdrop-filter: blur(6px) !important;
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
    }

    .stat-icon {
      font-size: 1.5rem;
      color: #16a34a;
    }

    .stat-header h3 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
    }

    .stat-content {
      padding: 0 1rem 1rem;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.25rem;
    }

    .stat-change {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .stat-change.positive {
      color: #16a34a;
    }

    .stat-change.negative {
      color: #ef4444;
    }

    .dashboard-content {
      margin-top: 2rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    .content-card {
      background: rgba(255, 255, 255, 0.06) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      backdrop-filter: blur(6px) !important;
    }

    .content-card h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #fff;
    }

    .activity-list {
      padding: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      font-size: 1.25rem;
      color: #16a34a;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 500;
      color: #fff;
      margin-bottom: 0.25rem;
    }

    .activity-time {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
    }

    .quick-actions button {
      justify-content: flex-start !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }

      .dashboard-header h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class AdminDashboardComponent {}
