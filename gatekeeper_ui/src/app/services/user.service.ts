import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    isActive: boolean;
    isDeleted: boolean;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    profileImage?: string | null;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImage?: string;
    isActive?: boolean;
    role?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
        return new HttpHeaders({
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        });
    }

    getUserById(userId: string): Observable<ApiResponse<User>> {
        return this.http.get<ApiResponse<User>>(`${this.apiUrl}/api/user/${userId}`, {
            headers: this.getAuthHeaders()
        }).pipe(catchError(this.handleError));
    }

    updateUser(userId: string, updateData: UpdateUserRequest): Observable<ApiResponse<User>> {
        return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/api/user/${userId}`, updateData, {
            headers: this.getAuthHeaders()
        }).pipe(catchError(this.handleError));
    }

    deleteUser(userId: string): Observable<ApiResponse<{ message: string }>> {
        return this.http.delete<ApiResponse<{ message: string }>>(`${this.apiUrl}/api/user/${userId}`, {
            headers: this.getAuthHeaders()
        }).pipe(catchError(this.handleError));
    }

    uploadAvatar(userId: string, file: File): Observable<ApiResponse<{ user: User; fileUrl: string }>> {
        const formData = new FormData();
        formData.append('profileImage', file);

        const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
        const headers = new HttpHeaders({
            'Authorization': token ? `Bearer ${token}` : ''
            // Content-Type'ı FormData için otomatik ayarlanacak
        });

        return this.http.post<ApiResponse<{ user: User; fileUrl: string }>>(`${this.apiUrl}/api/user/${userId}/upload-avatar`, formData, {
            headers: headers
        }).pipe(catchError(this.handleError));
    }

    getAllUsers(): Observable<ApiResponse<User[]>> {
        return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/api/user`, {
            headers: this.getAuthHeaders()
        }).pipe(catchError(this.handleError));
    }

    private handleError(error: any): Observable<never> {
        console.error('User Service Error:', error);
        let errorMessage = 'Bir hata oluştu';

        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return throwError(() => new Error(errorMessage));
    }
}
