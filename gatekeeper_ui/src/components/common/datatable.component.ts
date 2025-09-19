import { Component, Input, Output, EventEmitter, OnInit, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

export interface DataTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'date' | 'status' | 'actions';
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableAction {
  label: string;
  icon: string;
  severity: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger';
  tooltip?: string;
  disabled?: (rowData: any) => boolean;
  visible?: (rowData: any) => boolean; // Butonun görünürlüğünü kontrol eder
}

@Component({
  selector: 'app-datatable',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TooltipModule,
    TagModule
  ],
  template: `
    <div class="datatable-container">
      <!-- Header -->
      <div class="datatable-header" *ngIf="title || showSearch">
        <div class="header-left">
          <h2 *ngIf="title" class="datatable-title">{{ title }}</h2>
          <p *ngIf="subtitle" class="datatable-subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-right" *ngIf="showSearch || headerActions">
          <ng-container *ngTemplateOutlet="headerActions"></ng-container>
          <div class="search-container" *ngIf="showSearch">
            <i class="pi pi-search search-icon"></i>
            <input 
              pInputText 
              type="text" 
              [(ngModel)]="globalFilterValue" 
              (input)="onGlobalFilter($event)"
              placeholder="Ara..."
              class="search-input"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <p-table 
        [value]="data" 
        [columns]="columns"
        [paginator]="paginator"
        [rows]="rows"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Toplam {totalRecords} kayıttan {first} - {last} arası gösteriliyor"
        [rowsPerPageOptions]="[10, 25, 50]"
        [globalFilterFields]="globalFilterFields"
        [loading]="loading"
        [scrollable]="scrollable"
        [scrollHeight]="scrollHeight"
        styleClass="custom-datatable"
        [tableStyle]="{'min-width': '50rem'}"
      >
        <!-- Column Templates -->
        <ng-template pTemplate="header" let-columns>
          <tr>
            <th *ngFor="let col of columns" 
                [style.width]="col.width"
                [style.text-align]="col.align || 'left'"
                [pSortableColumn]="col.sortable ? col.field : null">
              {{ col.header }}
              <p-sortIcon *ngIf="col.sortable" [field]="col.field"></p-sortIcon>
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-rowData let-rowIndex="rowIndex">
          <tr>
            <td *ngFor="let col of columns" 
                [style.text-align]="col.align || 'left'">
              
              <!-- Text Column -->
              <span *ngIf="col.type === 'text' || !col.type">
                {{ getFieldValue(rowData, col.field) }}
              </span>

              <!-- Date Column -->
              <span *ngIf="col.type === 'date'">
                {{ getFieldValue(rowData, col.field) ? (getFieldValue(rowData, col.field) | date:'dd/MM/yyyy HH:mm') : '-' }}
              </span>

              <!-- Status Column -->
              <p-tag *ngIf="col.type === 'status'" 
                     [value]="getStatusValue(getFieldValue(rowData, col.field))"
                     [severity]="getStatusSeverity(getFieldValue(rowData, col.field))">
              </p-tag>

              <!-- Actions Column -->
              <div *ngIf="col.type === 'actions'" class="action-buttons">
                <ng-container *ngFor="let action of actions">
                  <button 
                    *ngIf="!action.visible || action.visible(rowData)"
                    pButton 
                    type="button"
                    [icon]="action.icon"
                    [severity]="action.severity"
                    [pTooltip]="action.tooltip || action.label"
                    [disabled]="action.disabled ? action.disabled(rowData) : false"
                    class="action-btn icon-only"
                    (click)="onActionClick(action, rowData, rowIndex)"
                  ></button>
                </ng-container>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Empty State -->
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="columns.length" class="empty-state">
              <div class="empty-content">
                <i class="pi pi-inbox empty-icon"></i>
                <h3>Veri Bulunamadı</h3>
                <p>Henüz hiç veri bulunmuyor.</p>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Loading State -->
        <ng-template pTemplate="loadingbody">
          <tr>
            <td [attr.colspan]="columns.length" class="loading-state">
              <div class="loading-content">
                <i class="pi pi-spin pi-spinner loading-icon"></i>
                <span>Yükleniyor...</span>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .datatable-container {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(6px);
      border-radius: 12px;
      overflow: hidden;
    }

    .datatable-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .header-left {
      flex: 1;
    }

    .datatable-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
    }

    .datatable-subtitle {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .search-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      z-index: 1;
    }

    .search-input {
      padding-left: 2.5rem !important;
      background: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      color: #fff !important;
      border-radius: 8px !important;
      min-width: 250px;
    }

    .search-input:focus {
      border-color: #16a34a !important;
      box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2) !important;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.5) !important;
    }

    /* Table Styles */
    :host ::ng-deep .custom-datatable {
      background: transparent !important;
    }

    :host ::ng-deep .custom-datatable .p-datatable-header {
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
    }

    :host ::ng-deep .custom-datatable .p-datatable-thead > tr > th {
      background: rgba(255, 255, 255, 0.05) !important;
      border: none !important;
      color: rgba(255, 255, 255, 0.9) !important;
      font-weight: 600 !important;
      padding: 1rem !important;
      font-size: 0.875rem !important;
    }

    :host ::ng-deep .custom-datatable .p-datatable-tbody > tr {
      background: transparent !important;
      border: none !important;
    }

    :host ::ng-deep .custom-datatable .p-datatable-tbody > tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.02) !important;
    }

    :host ::ng-deep .custom-datatable .p-datatable-tbody > tr:hover {
      background: rgba(255, 255, 255, 0.05) !important;
    }

    :host ::ng-deep .custom-datatable .p-datatable-tbody > tr > td {
      border: none !important;
      color: rgba(255, 255, 255, 0.9) !important;
      padding: 1rem !important;
      font-size: 0.875rem !important;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .action-btn {
      min-width: auto !important;
      padding: 0.5rem !important;
      font-size: 0.75rem !important;
    }

    .action-btn.icon-only {
      width: 2rem !important;
      height: 2rem !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .action-btn.icon-only .p-button-icon {
      margin: 0 !important;
      font-size: 0.875rem !important;
    }

    /* Danger button styling */
    :host ::ng-deep .action-btn.p-button-danger {
      background: #dc2626 !important;
      border-color: #dc2626 !important;
    }

    :host ::ng-deep .action-btn.p-button-danger:hover {
      background: #b91c1c !important;
      border-color: #b91c1c !important;
    }

    :host ::ng-deep .action-btn.p-button-danger:focus {
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
    }

    /* Status Tags */
    :host ::ng-deep .p-tag {
      font-size: 0.75rem !important;
      padding: 0.25rem 0.5rem !important;
    }

    /* Paginator */
    :host ::ng-deep .p-paginator {
      background: rgba(255, 255, 255, 0.05) !important;
      border: none !important;
      border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
      color: rgba(255, 255, 255, 0.9) !important;
    }

    :host ::ng-deep .p-paginator .p-paginator-pages .p-paginator-page {
      background: transparent !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      color: rgba(255, 255, 255, 0.9) !important;
    }

    :host ::ng-deep .p-paginator .p-paginator-pages .p-paginator-page:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }

    :host ::ng-deep .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
      background: #16a34a !important;
      border-color: #16a34a !important;
    }

    :host ::ng-deep .p-paginator .p-dropdown {
      background: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      color: rgba(255, 255, 255, 0.9) !important;
    }

    /* Empty State */
    .empty-state {
      text-align: center !important;
      padding: 3rem 1rem !important;
    }

    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .empty-icon {
      font-size: 3rem;
      color: rgba(255, 255, 255, 0.3);
    }

    .empty-content h3 {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.1rem;
    }

    .empty-content p {
      margin: 0;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.9rem;
    }

    /* Loading State */
    .loading-state {
      text-align: center !important;
      padding: 2rem 1rem !important;
    }

    .loading-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .loading-icon {
      font-size: 1.2rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .datatable-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .search-input {
        min-width: 100% !important;
      }

      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }

      .action-btn.icon-only {
        width: 1.75rem !important;
        height: 1.75rem !important;
      }
    }
  `]
})
export class DataTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: DataTableColumn[] = [];
  @Input() actions: DataTableAction[] = [];
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() showSearch: boolean = true;
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() loading: boolean = false;
  @Input() scrollable: boolean = false;
  @Input() scrollHeight: string = '400px';

  @Output() actionClick = new EventEmitter<{ action: DataTableAction, rowData: any, rowIndex: number }>();

  @ContentChild('headerActions', { static: false }) headerActions?: TemplateRef<any>;

  globalFilterValue: string = '';
  globalFilterFields: string[] = [];

  ngOnInit() {
    // Global filter için sadece text tipindeki kolonları ekle
    this.globalFilterFields = this.columns
      .filter(col => col.type === 'text' || !col.type)
      .map(col => col.field);
  }

  getFieldValue(rowData: any, field: string): any {
    const value = field.split('.').reduce((obj, key) => obj?.[key], rowData);

    // Eksik alanlar için fallback değerler
    if (value === undefined || value === null) {
      switch (field) {
        case 'firstName':
        case 'lastName':
          return '-';
        case 'lastLoginAt':
          return null; // Date tipi için null
        case 'profileImage':
          return null;
        default:
          return value;
      }
    }

    return value;
  }

  getStatusValue(status: any): string {
    // Boolean değerler için
    if (typeof status === 'boolean') {
      return status ? 'Aktif' : 'Pasif';
    }

    // String değerler için
    if (typeof status === 'string') {
      return status;
    }

    return status?.toString() || '-';
  }

  getStatusSeverity(status: any): string {
    // Boolean değerler için
    if (typeof status === 'boolean') {
      return status ? 'success' : 'danger';
    }

    // String değerler için
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'active':
        case 'aktif':
        case 'online':
          return 'success';
        case 'inactive':
        case 'pasif':
        case 'offline':
          return 'danger';
        case 'pending':
        case 'beklemede':
          return 'warning';
        case 'blocked':
        case 'engellenmiş':
          return 'danger';
        default:
          return 'info';
      }
    }

    return 'info';
  }

  onActionClick(action: DataTableAction, rowData: any, rowIndex: number) {
    this.actionClick.emit({ action, rowData, rowIndex });
  }

  onGlobalFilter(event: any) {
    // Global filter işlemi PrimeNG tarafından otomatik yapılır
  }
}
