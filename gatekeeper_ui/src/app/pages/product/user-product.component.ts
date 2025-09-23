import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { ProductService, ProductDto } from '../../services/product.service';
import { environment } from '../../../environments/environment';

interface ProductCategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
}

interface Product {
    _id: string;
    name: string;
    description: string;
    slug: string;
    price: number;
    photo_url: string;
    category: ProductCategory;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

@Component({
    selector: 'app-user-product',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        CardModule,
        BadgeModule,
        DividerModule
    ],
    template: `
    <div class="user-products-container">
      <!-- Sayfa Başlığı -->
      <div class="page-header">
        <h1>Ürünlerimiz</h1>
        <p>Tüm ürünlerimizi kategorilere göre keşfedin</p>
      </div>

      <!-- Kategori Filtresi -->
      <div class="category-filter">
        <div class="filter-container">
          <label>Kategori Seçin:</label>
          <div class="category-buttons">
            <button 
              class="category-btn" 
              [class.active]="selectedCategoryFilter === 'all'"
              (click)="onCategorySelect('all')">
              Tüm Kategoriler
            </button>
            <button 
              class="category-btn" 
              [class.active]="selectedCategoryFilter === category.slug"
              (click)="onCategorySelect(category.slug)"
              *ngFor="let category of categories">
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>

          <!-- Ürün Kartları Grid -->
      <div class="products-grid" *ngIf="filteredProducts.length > 0">
        <div class="product-card" *ngFor="let product of filteredProducts">
              <!-- Ürün Resmi -->
              <div class="product-image">
                <img [src]="product.photo_url" [alt]="product.name" />
                <div class="product-status" [class.active]="product.isActive" [class.inactive]="!product.isActive">
                  {{ product.isActive ? 'Aktif' : 'Pasif' }}
                </div>
              </div>

              <!-- Ürün Bilgileri -->
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-price">{{ formatPrice(product.price) }}</div>
              </div>

              <!-- Detay Butonu -->
              <div class="product-actions">
                <p-button label="Detayları Gör" icon="pi pi-eye" severity="secondary" size="small"
                  (onClick)="openProductDetail(product)">
                </p-button>
              </div>
        </div>
      </div>

      <!-- Ürün Bulunamadı -->
      <div class="no-products" *ngIf="filteredProducts.length === 0">
        <div class="no-products-content">
          <i class="pi pi-box" style="font-size: 4rem; color: #6c757d;"></i>
          <h3>Henüz ürün bulunmuyor</h3>
          <p>Yakında yeni ürünler eklenecek!</p>
        </div>
      </div>
    </div>

    <!-- Ürün Detay Modalı -->
    <p-dialog header="Ürün Detayları" [(visible)]="showProductModal" [modal]="true" [style]="{width: '800px'}"
      [closable]="true" (onHide)="closeProductModal()">
      
      <div class="product-detail-modal" *ngIf="selectedProduct">
        <!-- Ürün Resmi -->
        <div class="modal-product-image">
          <img [src]="selectedProduct.photo_url" [alt]="selectedProduct.name" />
        </div>

        <!-- Ürün Bilgileri -->
        <div class="modal-product-info">
          <h2>{{ selectedProduct.name }}</h2>
          
          <div class="product-detail-item">
            <label>Kategori:</label>
            <span class="category-badge">{{ selectedProduct.category.name }}</span>
          </div>

          <div class="product-detail-item">
            <label>Açıklama:</label>
            <p>{{ selectedProduct.description }}</p>
          </div>

          <div class="product-detail-item">
            <label>Fiyat:</label>
            <span class="price-highlight">{{ formatPrice(selectedProduct.price) }}</span>
          </div>

          <div class="product-detail-item">
            <label>Slug:</label>
            <code>{{ selectedProduct.slug }}</code>
          </div>

          <div class="product-detail-item">
            <label>Durum:</label>
            <p-badge [value]="selectedProduct.isActive ? 'Aktif' : 'Pasif'"
              [severity]="selectedProduct.isActive ? 'success' : 'warn'">
            </p-badge>
          </div>

          <div class="product-detail-item">
            <label>Oluşturulma Tarihi:</label>
            <span>{{ formatDate(selectedProduct.createdAt) }}</span>
          </div>

          <div class="product-detail-item">
            <label>Son Güncelleme:</label>
            <span>{{ formatDate(selectedProduct.updatedAt) }}</span>
          </div>
        </div>
      </div>

    </p-dialog>
  `,
    styles: [`
    .user-products-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      background: #121212;
      min-height: 100vh;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      margin-bottom: 0.5rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
    
    .page-header p {
      font-size: 1.1rem;
      color: #e0e0e0;
      margin: 0;
    }

    /* Kategori Filtresi */
    .category-filter {
      margin-bottom: 2rem;
    }
    
    .filter-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      justify-content: center;
      padding: 1.5rem;
      background: #121212;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    
    .filter-container label {
      font-weight: 600;
      color: white;
      font-size: 1.1rem;
      white-space: nowrap;
    }
    
    .category-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .category-btn {
      background: #121212;
      border: 2px solid #333;
      color: #e0e0e0;
      font-weight: 600;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      transition: all 0.3s ease;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    .category-btn:hover {
      background: linear-gradient(135deg, #48DAA3 0%, #3BC493 100%);
      border-color: #48DAA3;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(72, 218, 163, 0.3);
    }
    
    .category-btn.active {
      background: linear-gradient(135deg, #48DAA3 0%, #3BC493 100%);
      border-color: #48DAA3;
      color: white;
      box-shadow: 0 4px 15px rgba(72, 218, 163, 0.3);
    }
    
    .category-btn.active:hover {
      background: linear-gradient(135deg, #3BC493 0%, #2FA882 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(72, 218, 163, 0.4);
    }


    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .product-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      border: 1px solid rgba(255,255,255,0.2);
    }
    
    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 35px rgba(0,0,0,0.15);
    }

    .product-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .product-card:hover .product-image img {
      transform: scale(1.05);
    }
    
    .product-status {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .product-status.active {
      background: #27ae60;
      color: white;
    }
    
    .product-status.inactive {
      background: #e74c3c;
      color: white;
    }

    .product-info {
      padding: 1.5rem;
    }
    
    .product-info .product-name {
      font-size: 1.3rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }
    
    .product-info .product-description {
      color: #7f8c8d;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .product-info .product-price {
      font-size: 1.4rem;
      font-weight: 700;
      color: #27ae60;
      margin-bottom: 1rem;
    }

    .product-actions {
      padding: 0 1.5rem 1.5rem;
    }
    
    .product-actions ::ng-deep .p-button {
      width: 100%;
      background: linear-gradient(135deg, #48DAA3 0%, #3BC493 100%);
      border: none;
      border-radius: 8px;
      padding: 0.75rem;
      font-weight: 600;
      transition: all 0.3s ease;
      color: white;
      box-shadow: 0 4px 15px rgba(72, 218, 163, 0.3);
    }
    
    .product-actions ::ng-deep .p-button:hover {
      background: linear-gradient(135deg, #3BC493 0%, #2FA882 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(72, 218, 163, 0.4);
    }
    

    .no-products {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    
    .no-products .no-products-content {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .no-products .no-products-content h3 {
      color: white;
      margin: 1rem 0 0.5rem;
      font-size: 1.5rem;
    }
    
    .no-products .no-products-content p {
      color: #e0e0e0;
      margin: 0;
    }

    /* Modal Dialog Stilleri - Siyah Tema */
    ::ng-deep .p-dialog {
      border-radius: 20px;
      box-shadow: 0 25px 80px rgba(0,0,0,0.8);
      border: 2px solid #333;
      overflow: hidden;
      background: #1a1a1a;
    }
    
    ::ng-deep .p-dialog-content {
      padding: 0;
      background: #1a1a1a;
    }
    
    ::ng-deep .p-dialog-header {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      color: white;
      padding: 1.5rem 2rem;
      border-bottom: 2px solid #333;
    }
    
    ::ng-deep .p-dialog-header .p-dialog-title {
      color: white;
      font-weight: 700;
      font-size: 1.5rem;
    }
    
    ::ng-deep .p-dialog-header .p-dialog-header-icon {
      color: white;
      background: rgba(255,255,255,0.1);
      border: 1px solid #333;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      transition: all 0.3s ease;
    }
    
    ::ng-deep .p-dialog-header .p-dialog-header-icon:hover {
      background: #ef4444;
      border-color: #ef4444;
      transform: scale(1.1);
    }
    

    .product-detail-modal {
      background: #1a1a1a;
      padding: 2rem;
      color: white;
    }

    .product-detail-modal .modal-product-image {
      text-align: center;
      margin-bottom: 2rem;
      background: #2d2d2d;
      padding: 2rem;
      border-radius: 16px;
      border: 1px solid #333;
    }
    
    .product-detail-modal .modal-product-image img {
      max-width: 100%;
      max-height: 300px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border: 2px solid #333;
    }
    
    .product-detail-modal .modal-product-info {
      background: #2d2d2d;
      padding: 2rem;
      border-radius: 16px;
      border: 1px solid #333;
    }
    
    .product-detail-modal .modal-product-info h2 {
      color: white;
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
      font-weight: 600;
      text-align: center;
      padding-bottom: 1rem;
      border-bottom: 2px solid #48DAA3;
    }
    
    .product-detail-modal .modal-product-info .product-detail-item {
      margin-bottom: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: #1a1a1a;
      border-radius: 12px;
      border-left: 4px solid #48DAA3;
      border: 1px solid #333;
    }
    
    .product-detail-modal .modal-product-info .product-detail-item label {
      font-weight: 600;
      color: #48DAA3;
      min-width: 120px;
      flex-shrink: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 0.9rem;
    }
    
    .product-detail-modal .modal-product-info .product-detail-item span,
    .product-detail-modal .modal-product-info .product-detail-item p {
      color: white;
      margin: 0;
      font-size: 1rem;
    }
    
    .product-detail-modal .modal-product-info .product-detail-item .category-badge {
      background: linear-gradient(135deg, #48DAA3 0%, #3BC493 100%);
      color: white;
      padding: 6px 16px;
      border-radius: 25px;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(72, 218, 163, 0.3);
    }
    
    .product-detail-modal .modal-product-info .product-detail-item .price-highlight {
      font-size: 1.8rem;
      font-weight: 700;
      color: #48DAA3;
      text-shadow: 0 0 10px rgba(72, 218, 163, 0.3);
    }
    
    .product-detail-modal .modal-product-info .product-detail-item code {
      background: #333;
      color: #48DAA3;
      padding: 6px 12px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      border: 1px solid #444;
    }


    @media (max-width: 768px) {
      .user-products-container {
        padding: 1rem;
      }
      
      .page-header h1 {
        font-size: 2rem;
      }
      
      .filter-container {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      
      .filter-container label {
        font-size: 1rem;
      }
      
      .category-selector ::ng-deep .p-selectbutton {
        justify-content: center;
      }
      
      .category-selector ::ng-deep .p-button {
        flex: 1;
        min-width: 120px;
      }
      
      .products-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }
      
      .category-header {
        padding: 1rem;
      }
      
      .category-header h2 {
        font-size: 1.5rem;
      }
      
      .product-info {
        padding: 1rem;
      }
      
      .product-actions {
        padding: 0 1rem 1rem;
      }
    }

    @media (max-width: 480px) {
      .user-products-container {
        padding: 0.5rem;
      }
      
      .page-header {
        margin-bottom: 2rem;
      }
      
      .page-header h1 {
        font-size: 1.8rem;
      }
      
    }
  `]
})
export class UserProductComponent implements OnInit {
    private readonly productService = inject(ProductService);

    // Ürünler ve kategoriler
    allProducts: Product[] = [];
    filteredProducts: Product[] = [];
    categories: ProductCategory[] = [];

    // Kategori filtreleme
    categoryFilterOptions: any[] = [];
    selectedCategoryFilter: any = null;

    // Modal durumu
    selectedProduct: Product | null = null;
    showProductModal: boolean = false;

    ngOnInit() {
        this.loadProducts();
    }

    private loadProducts() {
        this.productService.list().subscribe({
            next: (products: ProductDto[]) => {
                // API modelini komponent içi modele dönüştür
                this.allProducts = products.map(p => ({
                    _id: p._id,
                    name: p.name,
                    description: p.description,
                    slug: p.slug,
                    price: p.price,
                    photo_url: p.photo_url?.startsWith('http') || p.photo_url?.startsWith('https')
                        ? p.photo_url
                        : (p.photo_url ? `${environment.apiUrl}${p.photo_url}` : ''),
                    category: {
                        _id: p.category?._id,
                        name: p.category?.name,
                        slug: p.category?.slug,
                        description: undefined
                    },
                    isActive: p.isActive,
                    isDeleted: p.isDeleted,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt
                }));

                // Benzersiz kategorileri hesapla
                const uniqueCategories = new Map<string, ProductCategory>();
                this.allProducts.forEach(product => {
                    if (product.category?.slug && !uniqueCategories.has(product.category.slug)) {
                        uniqueCategories.set(product.category.slug, product.category);
                    }
                });
                this.categories = Array.from(uniqueCategories.values());

                // Kategori filtre seçenekleri
                this.categoryFilterOptions = [
                    { label: 'Tüm Kategoriler', value: 'all', icon: 'pi pi-globe' },
                    ...this.categories.map(category => ({
                        label: category.name,
                        value: category.slug,
                        icon: 'pi pi-tag'
                    }))
                ];

                // Başlangıçta tüm ürünleri göster
                this.selectedCategoryFilter = 'all';
                this.applyFilter('all');
            },
            error: (err) => {
                console.error('[UserProductComponent] Ürünler yüklenemedi:', err);
                this.allProducts = [];
                this.filteredProducts = [];
                this.categories = [];
            }
        });
    }

    openProductDetail(product: Product) {
        this.selectedProduct = product;
        this.showProductModal = true;
    }

    closeProductModal() {
        this.selectedProduct = null;
        this.showProductModal = false;
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price);
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('tr-TR');
    }

    onCategorySelect(categorySlug: string) {
        console.log('[UserProductComponent] Category selected:', categorySlug);
        this.selectedCategoryFilter = categorySlug;
        this.applyFilter(categorySlug);
    }

    private applyFilter(filterValue: string) {
        console.log('[UserProductComponent] applyFilter called with:', filterValue);
        console.log('[UserProductComponent] Available categories:', this.categories);
        console.log('[UserProductComponent] Available products:', this.allProducts);

        if (filterValue === 'all') {
            // Tüm ürünleri göster
            this.filteredProducts = [...this.allProducts];
            console.log('[UserProductComponent] Showing all products');
        } else {
            // Sadece seçilen kategorideki ürünleri göster
            this.filteredProducts = this.allProducts.filter(product =>
                product.category.slug === filterValue
            );
            console.log('[UserProductComponent] Showing products for category:', filterValue);
        }

        console.log('[UserProductComponent] Final filteredProducts:', this.filteredProducts);
    }
}
