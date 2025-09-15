import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user?: {
            _id: string;
            username: string;
            email: string;
            role: {
                _id: string;
                name: string;
            };
        };
        tokens?: {
            accessToken: string;
            refreshToken: string;
            accessTokenExpiresAt: number;
            refreshTokenExpiresAt: number;
        };
    } | null;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    data: {
        user: any;
    } | null;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T | null;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/login`, credentials)
            .pipe(
                catchError(this.handleError)
            );
    }

    register(userData: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.apiUrl}/api/auth/register`, userData)
            .pipe(
                catchError(this.handleError)
            );
    }

    verifyEmail(otpCode: string, token: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/api/auth/verify-email`, {
            otpCode,
            token
        }).pipe(
            catchError(this.handleError)
        );
    }

    forgotPassword(email: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/api/auth/forgot-password`, { email })
            .pipe(
                catchError(this.handleError)
            );
    }

    resetPassword(otpCode: string, password: string, token: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/api/auth/reset-password`, {
            otpCode,
            password,
            token
        }).pipe(
            catchError(this.handleError)
        );
    }

    logout(refreshToken: string): Observable<ApiResponse> {
        return this.http.post<ApiResponse>(`${this.apiUrl}/api/auth/logout`, { refreshToken })
            .pipe(
                catchError(this.handleError)
            );
    }

    // Token yönetimi
    setTokens(accessToken: string, refreshToken: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
        }
    }

    getAccessToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    }

    getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('refreshToken');
        }
        return null;
    }

    clearTokens(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('jwt'); // Eski token'ı da temizle
        }
    }

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Beklenmeyen bir hata oluştu';

        if (error.error instanceof ErrorEvent) {
            // Client-side hata
            errorMessage = `Hata: ${error.error.message}`;
        } else {
            // Server-side hata
            if (error.error?.message) {
                errorMessage = error.error.message;
            } else if (error.status === 0) {
                errorMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
            } else if (error.status === 401) {
                errorMessage = 'Geçersiz kullanıcı adı veya şifre';
            } else if (error.status === 400) {
                errorMessage = 'Geçersiz istek. Lütfen bilgilerinizi kontrol edin.';
            } else if (error.status >= 500) {
                errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
            }
        }

        console.error('[AuthService][ERROR]', error);
        return throwError(() => new Error(errorMessage));
    }
}
