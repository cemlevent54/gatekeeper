import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Permission {
    id: string;
    key: string;
    description: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePermissionRequest {
    key: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdatePermissionRequest {
    key?: string;
    description?: string;
    isActive?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface RolePermissionMatrix {
    roles: RoleMatrixItem[];
    permissions: PermissionMatrixItem[];
}

export interface RoleMatrixItem {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    permissions: PermissionMatrixItem[];
    createdAt: string;
}

export interface PermissionMatrixItem {
    id: string;
    key: string;
    description: string;
    isActive: boolean;
    createdAt: string;
}

export interface UpdateRolePermissionsDto {
    permissionIds: string[];
}

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {
    private apiUrl = `${environment.apiUrl}/api/permissions`;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        // SSR uyumluluğu için localStorage kontrolü
        if (typeof window !== 'undefined' && window.localStorage) {
            const token = localStorage.getItem('jwt');
            return new HttpHeaders({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            });
        }
        return new HttpHeaders({
            'Content-Type': 'application/json'
        });
    }

    // Tüm izinleri getir
    getAllPermissions(): Observable<ApiResponse<Permission[]>> {
        return this.http.get<ApiResponse<Permission[]>>(this.apiUrl, {
            headers: this.getHeaders()
        });
    }

    // Belirli izni getir
    getPermissionById(id: string): Observable<ApiResponse<Permission>> {
        return this.http.get<ApiResponse<Permission>>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    // Yeni izin oluştur
    createPermission(permission: CreatePermissionRequest): Observable<ApiResponse<Permission>> {
        return this.http.post<ApiResponse<Permission>>(this.apiUrl, permission, {
            headers: this.getHeaders()
        });
    }

    // İzni güncelle
    updatePermission(id: string, permission: UpdatePermissionRequest): Observable<ApiResponse<Permission>> {
        return this.http.patch<ApiResponse<Permission>>(`${this.apiUrl}/${id}`, permission, {
            headers: this.getHeaders()
        });
    }

    // Kullanıcı izinlerini getir
    getUserPermissions(userId: string): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/user/${userId}`, {
            headers: this.getHeaders()
        });
    }

    // Rol izinlerini getir
    getRolePermissions(roleId: string): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.apiUrl}/role/${roleId}`, {
            headers: this.getHeaders()
        });
    }

    // Rol-izin matrisini getir
    getRolePermissionMatrix(): Observable<ApiResponse<RolePermissionMatrix>> {
        return this.http.get<ApiResponse<RolePermissionMatrix>>(`${this.apiUrl}/matrix`, {
            headers: this.getHeaders()
        });
    }

    // Rol izinlerini güncelle
    updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto): Observable<ApiResponse<any>> {
        return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/role/${roleId}/assign`, dto, {
            headers: this.getHeaders()
        });
    }
}
