import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
}

export interface ProductDto {
    _id: string;
    name: string;
    description: string;
    slug: string;
    price: number;
    photo_url: string;
    category: {
        _id: string;
        name: string;
        slug: string;
    };
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDto {
    name: string;
    description: string;
    slug: string;
    price: number;
    category: string;
    isActive?: boolean;
}

export interface UpdateProductDto {
    name?: string;
    description?: string;
    slug?: string;
    price?: number;
    category?: string;
    isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/api/product`;

    private getAuthHeaders(): HttpHeaders {
        let token: string | null = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('jwt') || localStorage.getItem('accessToken');
        }
        return new HttpHeaders({
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        });
    }

    private getFormDataHeaders(): HttpHeaders {
        let token: string | null = null;
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('jwt') || localStorage.getItem('accessToken');
        }
        return new HttpHeaders({
            'Authorization': token ? `Bearer ${token}` : ''
            // FormData için Content-Type header'ı eklemiyoruz
        });
    }

    list(): Observable<ProductDto[]> {
        return this.http.get<ApiResponse<ProductDto[]>>(this.baseUrl, { headers: this.getAuthHeaders() })
            .pipe(
                map(response => response.data || []),
                catchError(error => {
                    console.error('[ProductService][list] Detaylı Hata:', {
                        status: error.status,
                        statusText: error.statusText,
                        message: error.message,
                        error: error.error,
                        url: error.url
                    });
                    return throwError(() => error);
                })
            );
    }

    get(id: string): Observable<ProductDto> {
        return this.http.get<ApiResponse<ProductDto>>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() })
            .pipe(
                map(response => response.data!),
                catchError(error => {
                    console.error('[ProductService][get] Hata:', error);
                    return throwError(() => error);
                })
            );
    }

    create(productData: CreateProductDto, photoFile?: File): Observable<ProductDto> {
        const formData = new FormData();

        // Form data'ya alanları ekle
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('slug', productData.slug);
        formData.append('price', productData.price.toString());
        formData.append('category', productData.category);

        if (productData.isActive !== undefined) {
            formData.append('isActive', productData.isActive.toString());
        }

        // Fotoğraf dosyası varsa ekle
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        return this.http.post<ApiResponse<ProductDto>>(this.baseUrl, formData, { headers: this.getFormDataHeaders() })
            .pipe(
                map(response => response.data!),
                catchError(error => {
                    console.error('[ProductService][create] Hata:', error);
                    return throwError(() => error);
                })
            );
    }

    update(id: string, productData: UpdateProductDto, photoFile?: File): Observable<ProductDto> {
        const formData = new FormData();

        // Sadece değişen alanları ekle
        if (productData.name !== undefined) formData.append('name', productData.name);
        if (productData.description !== undefined) formData.append('description', productData.description);
        if (productData.slug !== undefined) formData.append('slug', productData.slug);
        if (productData.price !== undefined) formData.append('price', productData.price.toString());
        if (productData.category !== undefined) formData.append('category', productData.category);
        if (productData.isActive !== undefined) formData.append('isActive', productData.isActive.toString());

        // Yeni fotoğraf dosyası varsa ekle
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        return this.http.patch<ApiResponse<ProductDto>>(`${this.baseUrl}/${id}`, formData, { headers: this.getFormDataHeaders() })
            .pipe(
                map(response => response.data!),
                catchError(error => {
                    console.error('[ProductService][update] Hata:', error);
                    return throwError(() => error);
                })
            );
    }

    delete(id: string): Observable<{ id: string; message: string }> {
        return this.http.delete<ApiResponse<{ id: string; message: string }>>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() })
            .pipe(
                map(response => response.data!),
                catchError(error => {
                    console.error('[ProductService][delete] Hata:', error);
                    return throwError(() => error);
                })
            );
    }
}
