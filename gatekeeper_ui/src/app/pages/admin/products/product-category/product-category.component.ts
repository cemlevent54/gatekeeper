import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DataTableComponent, DataTableColumn, DataTableAction } from '../../../../../components/common/datatable.component';
import { ProductCategoryService, ProductCategoryDto } from '../../../../services/product-category.service';

interface CategoryItem extends ProductCategoryDto { }

@Component({
    selector: 'app-product-categories',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
        InputTextModule,
        DataTableComponent
    ],
    providers: [ConfirmationService],
    template: `
    <p-toast position="bottom-right"></p-toast>

    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Kategoriler</h1>
          <p class="page-subtitle">Ürün kategorilerini yönetin</p>
        </div>
        <button pButton type="button" icon="pi pi-plus" label="Add Category" (click)="openCreate()"></button>
      </div>

      <app-datatable
        [title]="'Kategori Listesi'"
        [subtitle]="'Toplam ' + categories.length + ' kategori'"
        [data]="categories"
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

    <p-dialog [(visible)]="modalVisible" [modal]="true" [draggable]="false" [resizable]="false" [style]="{width: '520px'}" [breakpoints]="{'960px': '95vw'}" [dismissableMask]="false" [closeOnEscape]="false" (onHide)="closeModal()">
      <ng-template pTemplate="header">
        <div class="dialog-header">
          <i class="pi" [ngClass]="isEditMode ? 'pi-pencil' : 'pi-plus'" style="margin-right: .5rem"></i>
          <span>{{ isEditMode ? 'Kategoriyi Güncelle' : 'Yeni Kategori Ekle' }}</span>
        </div>
      </ng-template>

      <form [formGroup]="form" class="form-grid">
        <div class="form-row">
          <label for="name">Kategori İsmi</label>
          <input pInputText id="name" formControlName="name" placeholder="Örn: Elektronik" (input)="autoSlug()" />
        </div>

        <div class="form-row">
          <label for="slug">Slug</label>
          <input pInputText id="slug" formControlName="slug" placeholder="elektronik" />
        </div>
      </form>

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
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; padding-top: .5rem; }
    .form-row { display: flex; flex-direction: column; gap: .5rem; }
    .form-row label { color: rgba(255,255,255,.9); font-size: .85rem; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: .5rem; width: 100%; }
  `]
})
export class ProductCategoryComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly confirmation = inject(ConfirmationService);
    private readonly messages = inject(MessageService);
    private readonly api = inject(ProductCategoryService);

    loading = false;
    saving = false;
    modalVisible = false;
    isEditMode = false;
    editingIndex: number | null = null;
    editingId: string | null = null;

    form: FormGroup = this.formBuilder.group({
        name: ['', Validators.required],
        slug: ['', Validators.required]
    });

    columns: DataTableColumn[] = [
        { field: 'name', header: 'Kategori', sortable: true, type: 'text' },
        { field: 'slug', header: 'Slug', sortable: true, type: 'text', width: '220px' },
        { field: 'createdAt', header: 'Oluşturulma', sortable: true, type: 'date', width: '200px' },
        { field: 'actions', header: 'İşlemler', type: 'actions', width: '140px', align: 'center' }
    ];

    rowActions: DataTableAction[] = [
        { label: 'Edit', icon: 'pi pi-pencil', severity: 'info', tooltip: 'Düzenle' },
        { label: 'Delete', icon: 'pi pi-trash', severity: 'danger', tooltip: 'Sil' }
    ];

    categories: CategoryItem[] = [];

    openCreate() {
        this.isEditMode = false;
        this.editingIndex = null;
        this.editingId = null;
        this.form.reset({ name: '', slug: '' });
        this.modalVisible = true;
    }

    ngOnInit() {
        this.fetchList();
    }

    private fetchList() {
        this.loading = true;
        this.api.list().subscribe({
            next: (data) => {
                this.categories = data as CategoryItem[];
            },
            error: () => {
                this.messages.add({ severity: 'error', summary: 'Hata', detail: 'Kategoriler getirilemedi' });
            },
            complete: () => this.loading = false
        });
    }

    openEdit(category: CategoryItem, index: number) {
        this.isEditMode = true;
        this.editingIndex = index;
        this.editingId = (category as any).id || (category as any)._id || null;
        this.form.reset({ name: category.name, slug: category.slug });
        this.modalVisible = true;
    }

    closeModal() {
        this.modalVisible = false;
        this.saving = false;
        this.editingId = null;
    }

    onTableAction(e: { action: DataTableAction; rowData: CategoryItem; rowIndex: number }) {
        if (e.action.label === 'Edit') {
            this.openEdit(e.rowData, e.rowIndex);
            return;
        }
        if (e.action.label === 'Delete') {
            this.confirmDelete(e.rowData, e.rowIndex);
            return;
        }
    }

    submit() {
        if (this.form.invalid) { return; }
        this.saving = true;

        const payload = this.form.value as Omit<CategoryItem, 'id' | 'createdAt' | 'updatedAt'>;

        if (this.isEditMode && this.editingIndex !== null) {
            const original = { ...this.categories[this.editingIndex] };
            const optimistic: CategoryItem = { ...original, ...payload, updatedAt: new Date() } as any;
            this.categories = this.categories.map((c, i) => i === this.editingIndex ? optimistic : c);
            const idForUpdate = (this.editingId || (original as any).id || (original as any)._id) as string;
            this.api.update(idForUpdate, payload).subscribe({
                next: (updated) => {
                    this.messages.add({ severity: 'success', summary: 'Güncellendi', detail: 'Kategori başarıyla güncellendi.' });
                    this.closeModal();
                },
                error: () => {
                    this.categories = this.categories.map((c, i) => i === this.editingIndex! ? original : c);
                    this.messages.add({ severity: 'error', summary: 'Hata', detail: 'Kategori güncellenemedi.' });
                },
                complete: () => this.saving = false
            });
        } else {
            const tempId = 'TMP-' + Math.random().toString(36).slice(2, 8);
            const optimistic: CategoryItem = { id: tempId, ...payload, createdAt: new Date() } as any;
            this.categories = [optimistic, ...this.categories];
            this.api.create(payload).subscribe({
                next: (created) => {
                    this.messages.add({ severity: 'success', summary: 'Eklendi', detail: 'Kategori başarıyla eklendi.' });
                    // temp kaydı gerçek kayıtla değiştir
                    this.categories = this.categories.map(c => c.id === tempId ? created as any : c);
                    this.closeModal();
                },
                error: () => {
                    this.categories = this.categories.filter(c => c.id !== tempId);
                    this.messages.add({ severity: 'error', summary: 'Hata', detail: 'Kategori eklenemedi.' });
                },
                complete: () => this.saving = false
            });
        }
    }

    confirmDelete(row: CategoryItem, index: number) {
        this.confirmation.confirm({
            header: 'Kategoriyi Sil',
            message: `${row.name} kategorisini silmek istediğinize emin misiniz?`,
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptLabel: 'Evet',
            rejectLabel: 'Hayır',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteWithOptimistic(row, index)
        });
    }

    private deleteWithOptimistic(row: CategoryItem, index: number) {
        const original = [...this.categories];
        this.categories = this.categories.filter((_, i) => i !== index);
        this.api.remove(row.id).subscribe({
            next: () => {
                this.messages.add({ severity: 'success', summary: 'Silindi', detail: 'Kategori başarıyla silindi.' });
            },
            error: () => {
                this.categories = original;
                this.messages.add({ severity: 'error', summary: 'Hata', detail: 'Kategori silinemedi.' });
            }
        });
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

    private simulateRequest(): Promise<void> { return Promise.resolve(); }

    private generateId(): string {
        const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
        const num = Date.now().toString().slice(-4);
        return `CAT-${rand}${num}`;
    }
}


