import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { DataTableComponent, DataTableColumn, DataTableAction } from '../../../../components/common/datatable.component';
import { RouterLink } from '@angular/router';

interface ProductCategoryOption {
    label: string;
    value: string;
}

interface ProductItem {
    id: string;
    name: string;
    slug: string;
    price: number;
    photo: string;
    category: string;
    createdAt: Date;
    updatedAt?: Date;
}

@Component({
    selector: 'app-admin-products',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
        InputTextModule,
        DataTableComponent,
        RouterLink
    ],
    providers: [ConfirmationService],
    template: `
    <p-toast position="bottom-right"></p-toast>
    <div class="page-container" >
      <div class="page-header">
        <div>
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle">Ürünlerinizi yönetin</p>
        </div>
        <div style="display:flex; gap:.5rem;">
          <button pButton type="button" icon="pi pi-plus" label="Add Product" (click)="openCreate()"></button>
          <button pButton type="button" routerLink="/admin/products/category" class="p-button-outlined">
            <i class="pi pi-sitemap" style="margin-right:.5rem"></i>
            <span>Category Management</span>
          </button>
        </div>
      </div>

      <app-datatable
        [title]="'Product List'"
        [subtitle]="'Toplam ' + products.length + ' ürün'"
        [data]="products"
        [columns]="columns"
        [actions]="rowActions"
        [paginator]="true"
        [rows]="10"
        [loading]="loading"
        [scrollable]="true"
        [scrollHeight]="'60vh'"
        (actionClick)="onTableAction($event)"
      >
      </app-datatable>
    </div>

    <p-dialog [(visible)]="modalVisible" [modal]="true" [draggable]="false" [resizable]="false" [style]="{width: '760px'}" [breakpoints]="{'960px': '95vw'}" [dismissableMask]="false" [closeOnEscape]="false" (onHide)="closeModal()">
      <ng-template pTemplate="header">
        <div class="dialog-header">
          <i class="pi" [ngClass]="isEditMode ? 'pi-pencil' : 'pi-plus'" style="margin-right: .5rem"></i>
          <span>{{ isEditMode ? 'Ürünü Güncelle' : 'Yeni Ürün Ekle' }}</span>
        </div>
      </ng-template>

      <div class="form-layout">
        <form [formGroup]="form" class="form-grid">

          <div class="form-row">
            <label for="name">Name</label>
            <input pInputText id="name" formControlName="name" placeholder="Ürün adı" (input)="autoSlug()" />
          </div>

          <div class="form-row">
            <label for="slug">Slug</label>
            <input pInputText id="slug" formControlName="slug" placeholder="ornek-urun" />
          </div>

          <div class="form-row">
            <label for="price">Price</label>
            <input pInputText type="number" step="0.01" id="price" formControlName="price" placeholder="0.00" />
          </div>

          <div class="form-row">
            <label for="category">Kategori</label>
            <select id="category" formControlName="category" class="p-inputtext p-component">
              <option value="" disabled selected>Kategori seçin</option>
              <option *ngFor="let opt of categoryOptions" [value]="opt.value">{{ opt.label }}</option>
            </select>
          </div>

          <div class="form-row">
            <label for="photo">Fotoğraf</label>
            <input type="file" id="photo" accept="image/*" (change)="onFileSelected($event)" />
            <button *ngIf="photoPreview" pButton type="button" label="Kaldır" class="p-button-text p-button-danger" icon="pi pi-times" (click)="clearPhoto()" style="margin-top:.5rem"></button>
          </div>
        </form>

        <div class="preview-panel">
          <div class="preview-box">
            <img *ngIf="photoPreview; else placeholder" [src]="photoPreview" alt="preview" />
            <ng-template #placeholder>
              <div class="preview-placeholder">
                <i class="pi pi-image"></i>
                <span>Önizleme</span>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton type="button" label="Vazgeç" severity="secondary" (click)="closeModal()"></button>
          <button pButton type="button" [label]="isEditMode ? 'Güncelle' : 'Ekle'" [disabled]="form.invalid || saving" (click)="submit()" [icon]="saving ? 'pi pi-spin pi-spinner' : (isEditMode ? 'pi pi-check' : 'pi pi-plus')"></button>
        </div>
      </ng-template>
    </p-dialog>

    <p-confirmDialog [style]="{width: '420px'}" [breakpoints]="{'960px': '95vw'}"></p-confirmDialog>
  `,
    styles: [`
    .page-container { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .page-title { margin: 0; color: #fff; font-size: 1.5rem; font-weight: 600; }
    .page-subtitle { margin: .25rem 0 0; color: rgba(255,255,255,.7); font-size: .9rem; }
    .dialog-header { display: flex; align-items: center; font-weight: 600; }
    .form-layout { display: grid; grid-template-columns: 1fr 320px; gap: 1rem; align-items: start; }
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; padding-top: .5rem; }
    .form-row { display: flex; flex-direction: column; gap: .5rem; }
    .form-row label { color: rgba(255,255,255,.9); font-size: .85rem; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: .5rem; width: 100%; }
    .preview-panel { display: flex; justify-content: center; align-items: center; }
    .preview-box { width: 100%; aspect-ratio: 1/1; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .preview-box img { width: 100%; height: 100%; object-fit: contain; background: rgba(255,255,255,.02); }
    .preview-placeholder { display: flex; flex-direction: column; align-items: center; gap: .5rem; color: rgba(255,255,255,.5); }
    .preview-placeholder .pi { font-size: 2rem; }
    @media (max-width: 960px) { .form-layout { grid-template-columns: 1fr; } }
  `]
})
export class ProductComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly confirmation = inject(ConfirmationService);
    private readonly messages = inject(MessageService);

    loading = false;
    saving = false;
    modalVisible = false;
    isEditMode = false;
    editingIndex: number | null = null;
    photoPreview: string | null = null;

    form: FormGroup = this.formBuilder.group({
        name: ['', Validators.required],
        slug: ['', Validators.required],
        price: [0, [Validators.required]],
        photo: [''],
        category: ['', Validators.required]
    });

    columns: DataTableColumn[] = [
        { field: 'name', header: 'Name', sortable: true, type: 'text' },
        { field: 'slug', header: 'Slug', sortable: true, type: 'text', width: '220px' },
        { field: 'price', header: 'Price', sortable: true, type: 'text', align: 'right', width: '140px' },
        { field: 'category', header: 'Kategori', sortable: true, type: 'text', width: '160px' },
        { field: 'createdAt', header: 'Oluşturulma', sortable: true, type: 'date', width: '200px' },
        { field: 'actions', header: 'İşlemler', type: 'actions', width: '140px', align: 'center' }
    ];

    rowActions: DataTableAction[] = [
        {
            label: 'Edit', icon: 'pi pi-pencil', severity: 'info', tooltip: 'Düzenle',
            visible: () => true
        },
        {
            label: 'Delete', icon: 'pi pi-trash', severity: 'danger', tooltip: 'Sil',
            visible: () => true
        }
    ];

    categoryOptions: ProductCategoryOption[] = [
        { label: 'Elektronik', value: 'electronics' },
        { label: 'Giyim', value: 'apparel' },
        { label: 'Ev & Yaşam', value: 'home' },
        { label: 'Kitap', value: 'books' }
    ];

    products: ProductItem[] = [
        { id: 'PRD-001', name: 'Kablosuz Kulaklık', slug: 'kablosuz-kulaklik', price: 1499.90, photo: 'https://picsum.photos/seed/1/100/100', category: 'electronics', createdAt: new Date() },
        { id: 'PRD-002', name: 'Kot Ceket', slug: 'kot-ceket', price: 899.50, photo: 'https://picsum.photos/seed/2/100/100', category: 'apparel', createdAt: new Date() },
        { id: 'PRD-003', name: 'Mutfak Bıçağı Seti', slug: 'mutfak-bicagi-seti', price: 499.00, photo: 'https://picsum.photos/seed/3/100/100', category: 'home', createdAt: new Date() },
        { id: 'PRD-004', name: 'Roman', slug: 'roman', price: 129.99, photo: 'https://picsum.photos/seed/4/100/100', category: 'books', createdAt: new Date() }
    ];

    openCreate() {
        this.isEditMode = false;
        this.editingIndex = null;
        this.form.reset({ name: '', slug: '', price: 0, photo: '', category: '' });
        this.photoPreview = null;
        this.modalVisible = true;
    }

    openEdit(product: ProductItem, index: number) {
        this.isEditMode = true;
        this.editingIndex = index;
        this.form.reset({ name: product.name, slug: product.slug, price: product.price, photo: product.photo, category: product.category });
        this.photoPreview = product.photo || null;
        this.modalVisible = true;
    }

    closeModal() {
        this.modalVisible = false;
        this.saving = false;
        this.photoPreview = null;
    }

    submit() {
        if (this.form.invalid) { return; }
        this.saving = true;

        const payload = this.form.value as Omit<ProductItem, 'createdAt' | 'updatedAt' | 'id'>;

        if (this.isEditMode && this.editingIndex !== null) {
            const original = { ...this.products[this.editingIndex] };
            const updated: ProductItem = { ...original, ...payload, updatedAt: new Date() };

            // optimistic update
            this.products = this.products.map((p, i) => i === this.editingIndex ? updated : p);
            this.simulateRequest()
                .then(() => {
                    this.messages.add({ severity: 'success', summary: 'Güncellendi', detail: 'Ürün başarıyla güncellendi.' });
                    this.closeModal();
                })
                .catch(() => {
                    // rollback
                    this.products = this.products.map((p, i) => i === this.editingIndex! ? original : p);
                    this.messages.add({ severity: 'error', summary: 'Hata', detail: 'Ürün güncellenemedi.' });
                })
                .finally(() => this.saving = false);
        } else {
            const created: ProductItem = { id: this.generateId(), ...payload, createdAt: new Date() } as ProductItem;
            // optimistic append
            this.products = [created, ...this.products];
            this.simulateRequest()
                .then(() => {
                    this.messages.add({ severity: 'success', summary: 'Eklendi', detail: 'Ürün başarıyla eklendi.' });
                    this.closeModal();
                })
                .catch(() => {
                    // rollback on failure
                    this.products = this.products.filter(p => p.id !== created.id);
                    this.messages.add({ severity: 'error', summary: 'Hata', detail: 'Ürün eklenemedi.' });
                })
                .finally(() => this.saving = false);
        }
    }

    onTableAction(e: { action: DataTableAction; rowData: ProductItem; rowIndex: number }) {
        if (e.action.label === 'Edit') {
            this.openEdit(e.rowData, e.rowIndex);
            return;
        }
        if (e.action.label === 'Delete') {
            this.confirmDelete(e.rowData, e.rowIndex);
            return;
        }
    }

    confirmDelete(row: ProductItem, index: number) {
        this.confirmation.confirm({
            header: 'Ürünü Sil',
            message: `${row.name} ürününü silmek istediğinize emin misiniz?`,
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptLabel: 'Evet',
            rejectLabel: 'Hayır',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteWithOptimistic(row, index)
        });
    }

    private deleteWithOptimistic(row: ProductItem, index: number) {
        const original = [...this.products];
        // optimistic remove
        this.products = this.products.filter((_, i) => i !== index);
        this.simulateRequest()
            .then(() => {
                this.messages.add({ severity: 'success', summary: 'Silindi', detail: 'Ürün başarıyla silindi.' });
            })
            .catch(() => {
                // rollback on failure
                this.products = original;
                this.messages.add({ severity: 'error', summary: 'Hata', detail: 'Ürün silinemedi.' });
            });
    }

    private simulateRequest(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), 500);
        });
    }

    private generateId(): string {
        const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
        const num = Date.now().toString().slice(-4);
        return `PRD-${rand}${num}`;
    }

    autoSlug() {
        const name: string = this.form.get('name')?.value || '';
        const slug = name
            .toString()
            .toLowerCase()
            .trim()
            .replace(/&/g, '-ve-')
            .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
            .replace(/[^a-z0-9-\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        if (!this.isEditMode || !this.form.get('slug')?.dirty) {
            this.form.patchValue({ slug });
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            return;
        }
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            this.photoPreview = result;
            this.form.patchValue({ photo: result });
        };
        reader.readAsDataURL(file);
    }

    clearPhoto() {
        this.photoPreview = null;
        this.form.patchValue({ photo: '' });
    }
}


