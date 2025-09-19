import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string;
    userCount: number;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RolesResponse {
    success: boolean;
    message: string;
    data: Role[];
}

export interface RoleResponse {
    success: boolean;
    message: string;
    data: Role;
}

export interface CreateRoleDto {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateRoleDto {
    name?: string;
    description?: string;
    isActive?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class RolesService {
    private apiUrl = `${environment.apiUrl}/api/roles`;

    constructor(private http: HttpClient) { }

    getAllRoles(): Observable<RolesResponse> {
        const token = localStorage.getItem('jwt');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        console.log('Roles service - API URL:', this.apiUrl);
        console.log('Roles service - Token:', token ? 'Mevcut' : 'Yok');

        return this.http.get<RolesResponse>(this.apiUrl, { headers }).pipe(
            catchError(error => {
                console.error('Roller getirilirken hata:', error);
                return throwError(() => error);
            })
        );
    }

    createRole(roleData: CreateRoleDto): Observable<RoleResponse> {
        const token = localStorage.getItem('jwt');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.http.post<RoleResponse>(this.apiUrl, roleData, { headers }).pipe(
            catchError(error => {
                console.error('Rol oluşturulurken hata:', error);
                return throwError(() => error);
            })
        );
    }

    updateRole(id: string, updateData: UpdateRoleDto): Observable<RoleResponse> {
        const token = localStorage.getItem('jwt');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.http.patch<RoleResponse>(`${this.apiUrl}/${id}`, updateData, { headers }).pipe(
            catchError(error => {
                console.error('Rol güncellenirken hata:', error);
                return throwError(() => error);
            })
        );
    }

    deleteRole(id: string): Observable<RoleResponse> {
        const token = localStorage.getItem('jwt');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.http.delete<RoleResponse>(`${this.apiUrl}/${id}`, { headers }).pipe(
            catchError(error => {
                console.error('Rol silinirken hata:', error);
                return throwError(() => error);
            })
        );
    }
}
