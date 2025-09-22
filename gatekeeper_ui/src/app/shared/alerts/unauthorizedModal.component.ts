import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-unauthorized-modal',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    template: `
    <div class="modal-overlay" *ngIf="visible" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Erişim Engellendi</h3>
          <button 
            pButton 
            type="button" 
            icon="pi pi-times" 
            class="p-button-text close-btn"
            (click)="close()"
          ></button>
        </div>
        <div class="modal-body unauthorized">
          <i class="pi pi-lock"></i>
          <p>{{ message || defaultMessage }}</p>
          <div class="modal-actions">
            <button pButton type="button" label="Tamam" (click)="close()"></button>
          </div>
        </div>
      </div>
    </div>
    `,
    styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
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
      max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #fff;
    }
    .close-btn { color: rgba(255, 255, 255, 0.7) !important; }
    .modal-body.unauthorized { padding: 1.5rem; text-align: center; }
    .modal-body.unauthorized i { font-size: 2rem; color: #ef4444; margin-bottom: 0.75rem; }
    .modal-body.unauthorized p { color: #fff; margin: 0 0 1rem 0; }
    .modal-actions { display: flex; gap: 1rem; justify-content: center; margin-top: 0.5rem; }
    @media (max-width: 768px) { .modal-content { margin: 1rem; } }
    `]
})
export class UnauthorizedModalComponent {
    @Input() visible = false;
    @Input() message = '';
    @Output() visibleChange = new EventEmitter<boolean>();

    defaultMessage = 'Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.';

    close(): void {
        this.visible = false;
        this.visibleChange.emit(this.visible);
    }
}


