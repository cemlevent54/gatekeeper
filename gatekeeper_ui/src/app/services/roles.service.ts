import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Role {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface RolesResponse {
    success: boolean;
    message: string;
    data: Role[];
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
}
