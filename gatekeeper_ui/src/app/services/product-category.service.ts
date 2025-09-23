import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductCategoryDto {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

@Injectable({ providedIn: 'root' })
export class ProductCategoryService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/api/product-category`;

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

    list(): Observable<ProductCategoryDto[]> {
        return this.http.get<ApiResponse<ProductCategoryDto[]>>(this.baseUrl, { headers: this.getAuthHeaders() })
            .pipe(
                map(r => r.data || []),
                catchError(error => {
                    console.error('[ProductCategoryService][list] Hata:', error);
                    return throwError(() => error);
                })
            );
    }

    get(idOrSlug: string): Observable<ProductCategoryDto> {
        return this.http.get<ApiResponse<ProductCategoryDto>>(`${this.baseUrl}/${idOrSlug}`, { headers: this.getAuthHeaders() }).pipe(map(r => r.data));
    }

    create(payload: { name: string; slug: string; description?: string }): Observable<ProductCategoryDto> {
        return this.http.post<ApiResponse<ProductCategoryDto>>(this.baseUrl, payload, { headers: this.getAuthHeaders() }).pipe(map(r => r.data));
    }

    update(id: string, payload: { name?: string; slug?: string; description?: string }): Observable<ProductCategoryDto> {
        return this.http.patch<ApiResponse<ProductCategoryDto>>(`${this.baseUrl}/${id}`, payload, { headers: this.getAuthHeaders() }).pipe(map(r => r.data));
    }

    remove(id: string): Observable<{ id: string; message: string }> {
        return this.http.delete<ApiResponse<{ id: string; message: string }>>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(map(r => r.data));
    }
}


