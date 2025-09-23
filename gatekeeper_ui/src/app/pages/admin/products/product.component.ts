import { Component, inject, OnInit } from '@angular/core';
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
import { ProductService, ProductDto, CreateProductDto, UpdateProductDto } from '../../../services/product.service';
import { ProductCategoryService, ProductCategoryDto } from '../../../services/product-category.service';
import { environment } from '../../../../environments/environment';

interface ProductCategoryOption {
  label: string;
  value: string;
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
            <label for="description">Description</label>
            <textarea pInputText id="description" formControlName="description" placeholder="Ürün açıklaması" rows="3"></textarea>
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
            <label for="category">Kategori <span class="required">*</span></label>
            <select id="category" formControlName="category" class="p-inputtext p-component" required>
              <option value="" disabled>Kategori seçin</option>
              <option *ngFor="let opt of categoryOptions" [value]="opt.value">{{ opt.label }}</option>
            </select>
            <small *ngIf="form.get('category')?.invalid && form.get('category')?.touched" class="p-error">
              Kategori seçimi zorunludur
            </small>
          </div>

          <div class="form-row">
            <label for="photo">Fotoğraf</label>
            <input type="file" id="photo" accept="image/*" (change)="onFileSelected($event)" />
            <button *ngIf="photoPreview" pButton type="button" label="Kaldır" class="p-button-text p-button-danger" icon="pi pi-times" (click)="clearPhoto()" style="margin-top:.5rem"></button>
          </div>
        </form>

        <div class="preview-panel">
          <div class="preview-box">
            <img *ngIf="photoPreview; else placeholder" [src]="getImageUrl(photoPreview)" alt="preview" />
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
          <button pButton type="button" [label]="isEditMode ? 'Güncelle' : 'Ekle'" [disabled]="form.invalid || saving || categoryOptions.length === 0" (click)="submit()" [icon]="saving ? 'pi pi-spin pi-spinner' : (isEditMode ? 'pi pi-check' : 'pi pi-plus')"></button>
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
    .form-row .required { color: #ff6b6b; margin-left: .25rem; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: .5rem; width: 100%; }
    .preview-panel { display: flex; justify-content: center; align-items: center; }
    .preview-box { width: 100%; aspect-ratio: 1/1; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .preview-box img { width: 100%; height: 100%; object-fit: contain; background: rgba(255,255,255,.02); }
    .preview-placeholder { display: flex; flex-direction: column; align-items: center; gap: .5rem; color: rgba(255,255,255,.5); }
    .preview-placeholder .pi { font-size: 2rem; }
    @media (max-width: 960px) { .form-layout { grid-template-columns: 1fr; } }
  `]
})
export class ProductComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(ProductCategoryService);

  loading = false;
  saving = false;
  modalVisible = false;
  isEditMode = false;
  editingIndex: number | null = null;
  photoPreview: string | null = null;

  form: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    slug: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    photo: [''],
    category: ['', Validators.required]
  });

  columns: DataTableColumn[] = [
    { field: 'name', header: 'Name', sortable: true, type: 'text' },
    { field: 'slug', header: 'Slug', sortable: true, type: 'text', width: '220px' },
    { field: 'price', header: 'Price', sortable: true, type: 'text', align: 'right', width: '140px' },
    { field: 'category.name', header: 'Kategori', sortable: true, type: 'text', width: '160px' },
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

  categoryOptions: ProductCategoryOption[] = [];
  products: ProductDto[] = [];
  selectedPhotoFile: File | null = null;

  ngOnInit() {
    console.log('[ProductComponent] ngOnInit başladı');
    console.log('[ProductComponent] Environment API URL:', environment.apiUrl);

    // Token'ın hazır olmasını bekle
    this.waitForTokenAndLoad();
  }

  private waitForTokenAndLoad() {
    const checkToken = () => {
      const token = localStorage.getItem('jwt') || localStorage.getItem('accessToken');
      if (token) {
        console.log('[ProductComponent] Token hazır, veriler yükleniyor...');
        this.loadProducts();
        this.loadCategories();
      } else {
        console.log('[ProductComponent] Token henüz hazır değil, 100ms bekleniyor...');
        setTimeout(checkToken, 100);
      }
    };

    checkToken();
  }

  openCreate() {
    this.isEditMode = false;
    this.editingIndex = null;
    this.form.reset({ name: '', description: '', slug: '', price: 0, photo: '', category: '' });
    this.photoPreview = null;
    this.selectedPhotoFile = null;

    // Kategoriler yüklenmemişse uyarı ver
    if (this.categoryOptions.length === 0) {
      this.messages.add({
        severity: 'warn',
        summary: 'Bekleyin',
        detail: 'Kategoriler yükleniyor...'
      });
    }

    this.modalVisible = true;
  }

  openEdit(product: ProductDto, index: number) {
    this.isEditMode = true;
    this.editingIndex = index;
    this.form.reset({
      name: product.name,
      description: product.description,
      slug: product.slug,
      price: product.price,
      photo: product.photo_url,
      category: product.category._id
    });
    this.photoPreview = product.photo_url || null;
    this.selectedPhotoFile = null;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.saving = false;
    this.photoPreview = null;
    this.selectedPhotoFile = null;
  }

  submit() {
    if (this.form.invalid) {
      this.messages.add({
        severity: 'warn',
        summary: 'Eksik Bilgi',
        detail: 'Lütfen tüm zorunlu alanları doldurun.'
      });
      return;
    }

    if (this.categoryOptions.length === 0) {
      this.messages.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Kategoriler henüz yüklenmedi. Lütfen bekleyin.'
      });
      return;
    }

    this.saving = true;

    const formData = this.form.value;

    if (this.isEditMode && this.editingIndex !== null) {
      const productId = this.products[this.editingIndex]._id;
      const updateData: UpdateProductDto = {
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        price: formData.price,
        category: formData.category
      };

      // Optimistic update için mevcut ürünü sakla
      const originalProduct = { ...this.products[this.editingIndex!] };

      // Kategori bilgisini güncelle
      const selectedCategory = this.categoryOptions.find(cat => cat.value === formData.category);
      const optimisticProduct: ProductDto = {
        ...originalProduct,
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        price: formData.price,
        photo_url: this.photoPreview || originalProduct.photo_url,
        category: {
          _id: formData.category,
          name: selectedCategory?.label || originalProduct.category.name,
          slug: selectedCategory?.value || originalProduct.category.slug
        },
        updatedAt: new Date().toISOString()
      };

      // Optimistic güncelleme
      this.products[this.editingIndex!] = optimisticProduct;

      this.productService.update(productId, updateData, this.selectedPhotoFile || undefined)
        .subscribe({
          next: (updatedProduct) => {
            // Gerçek veri ile değiştir, kategori bilgisini koru
            console.log('[ProductComponent] API\'den gelen güncellenmiş ürün:', updatedProduct);

            // API'den gelen ürünün kategori bilgisi eksikse optimistic update'teki bilgiyi kullan
            let categoryInfo = updatedProduct.category;
            if (!categoryInfo || typeof categoryInfo === 'string' || !categoryInfo.name) {
              // Eğer kategori bilgisi eksikse veya sadece ID ise, optimistic update'teki bilgiyi kullan
              categoryInfo = optimisticProduct.category;
            }

            const finalProduct: ProductDto = {
              ...updatedProduct,
              category: categoryInfo
            };

            this.products[this.editingIndex!] = finalProduct;
            this.messages.add({
              severity: 'success',
              summary: 'Güncellendi',
              detail: 'Ürün başarıyla güncellendi.'
            });
            this.closeModal();
          },
          error: (error) => {
            // Hata durumunda orijinal veriye geri dön
            this.products[this.editingIndex!] = originalProduct;
            console.error('Ürün güncellenirken hata:', error);
            this.messages.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.message || 'Ürün güncellenemedi.'
            });
          },
          complete: () => {
            this.saving = false;
          }
        });
    } else {
      const createData: CreateProductDto = {
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        price: formData.price,
        category: formData.category
      };

      // Optimistic update için geçici ürün oluştur
      const selectedCategory = this.categoryOptions.find(cat => cat.value === formData.category);
      const tempProduct: ProductDto = {
        _id: `temp-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        price: formData.price,
        photo_url: this.photoPreview || '',
        category: {
          _id: formData.category,
          name: selectedCategory?.label || 'Bilinmeyen Kategori',
          slug: selectedCategory?.value || ''
        },
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Optimistic ekleme
      this.products = [tempProduct, ...this.products];

      this.productService.create(createData, this.selectedPhotoFile || undefined)
        .subscribe({
          next: (newProduct) => {
            // Gerçek veri ile değiştir, kategori bilgisini koru
            console.log('[ProductComponent] API\'den gelen ürün:', newProduct);

            // API'den gelen ürünün kategori bilgisi eksikse optimistic update'teki bilgiyi kullan
            let categoryInfo = newProduct.category;
            if (!categoryInfo || typeof categoryInfo === 'string' || !categoryInfo.name) {
              // Eğer kategori bilgisi eksikse veya sadece ID ise, optimistic update'teki bilgiyi kullan
              categoryInfo = tempProduct.category;
            }

            const finalProduct: ProductDto = {
              ...newProduct,
              category: categoryInfo
            };

            this.products = this.products.map(p =>
              p._id === tempProduct._id ? finalProduct : p
            );
            this.messages.add({
              severity: 'success',
              summary: 'Eklendi',
              detail: 'Ürün başarıyla eklendi.'
            });
            this.closeModal();
          },
          error: (error) => {
            // Hata durumunda optimistic eklenen ürünü kaldır
            this.products = this.products.filter(p => p._id !== tempProduct._id);
            console.error('Ürün oluşturulurken hata:', error);
            this.messages.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.message || 'Ürün eklenemedi.'
            });
          },
          complete: () => {
            this.saving = false;
          }
        });
    }
  }

  onTableAction(e: { action: DataTableAction; rowData: ProductDto; rowIndex: number }) {
    if (e.action.label === 'Edit') {
      this.openEdit(e.rowData, e.rowIndex);
      return;
    }
    if (e.action.label === 'Delete') {
      this.confirmDelete(e.rowData, e.rowIndex);
      return;
    }
  }

  confirmDelete(row: ProductDto, index: number) {
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

  private deleteWithOptimistic(row: ProductDto, index: number) {
    const original = [...this.products];
    // optimistic remove
    this.products = this.products.filter((_, i) => i !== index);

    this.productService.delete(row._id)
      .subscribe({
        next: () => {
          this.messages.add({
            severity: 'success',
            summary: 'Silindi',
            detail: 'Ürün başarıyla silindi.'
          });
        },
        error: (error) => {
          // rollback on failure
          this.products = original;
          console.error('Ürün silinirken hata:', error);
          this.messages.add({
            severity: 'error',
            summary: 'Hata',
            detail: error.error?.message || 'Ürün silinemedi.'
          });
        }
      });
  }

  private loadProducts() {
    this.loading = true;
    this.productService.list()
      .subscribe({
        next: (products) => {
          console.log('[ProductComponent] Ürünler yüklendi:', products);
          this.products = products;
          this.loading = false;
        },
        error: (error) => {
          console.error('[ProductComponent] Ürünler yüklenirken hata:', error);
          this.loading = false;

          // İlk yükleme sırasında 401 hatası gelirse snackbar gösterme
          if (error.status === 401) {
            console.log('[ProductComponent] 401 hatası - token sorunu, snackbar gösterilmiyor');
            return;
          }

          let errorMessage = 'Ürünler yüklenemedi.';

          if (error.status === 403) {
            errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
          } else if (error.status === 404) {
            errorMessage = 'API endpoint bulunamadı.';
          } else if (error.status === 0) {
            errorMessage = 'Sunucuya bağlanılamıyor. API çalışıyor mu kontrol edin.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.messages.add({
            severity: 'error',
            summary: 'Hata',
            detail: errorMessage
          });
        }
      });
  }

  private loadCategories() {
    console.log('[ProductComponent] Kategoriler yükleniyor...');
    this.categoryService.list()
      .subscribe({
        next: (categories) => {
          console.log('[ProductComponent] Kategoriler yüklendi:', categories);
          this.categoryOptions = categories.map(cat => ({
            label: cat.name,
            value: cat.id
          }));
        },
        error: (error) => {
          console.error('[ProductComponent] Kategoriler yüklenirken hata:', error);

          // İlk yükleme sırasında 401 hatası gelirse snackbar gösterme
          if (error.status === 401) {
            console.log('[ProductComponent] Kategoriler için 401 hatası - token sorunu, snackbar gösterilmiyor');
            return;
          }

          let errorMessage = 'Kategoriler yüklenemedi.';

          if (error.status === 403) {
            errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
          } else if (error.status === 404) {
            errorMessage = 'Kategori API endpoint bulunamadı.';
          } else if (error.status === 0) {
            errorMessage = 'Sunucuya bağlanılamıyor. API çalışıyor mu kontrol edin.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.messages.add({
            severity: 'error',
            summary: 'Hata',
            detail: errorMessage
          });
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.messages.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Dosya boyutu 5MB\'dan büyük olamaz.'
      });
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      this.messages.add({
        severity: 'error',
        summary: 'Hata',
        detail: 'Sadece resim dosyaları kabul edilir.'
      });
      return;
    }

    this.selectedPhotoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.photoPreview = result;
    };
    reader.readAsDataURL(file);
  }

  clearPhoto() {
    this.photoPreview = null;
    this.selectedPhotoFile = null;
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';

    // Eğer zaten tam URL ise (http/https ile başlıyorsa) direkt döndür
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Eğer base64 data URL ise direkt döndür
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }

    // Relative path ise API base URL'ini ekle
    return `${environment.apiUrl}${imagePath}`;
  }
}


