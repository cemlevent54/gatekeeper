import { Routes } from '@angular/router';
import { LoginPageComponent } from '@pages/login/login.component';
import { RegisterPageComponent } from '@pages/register/register.component';
import { UserAccountComponent } from '@pages/account/account.component';
import { HomePageComponent } from '@pages/home/home.component';
import { VerifyEmailPageComponent } from '@pages/verify-email/verify-email.component';
import { ForgotPasswordPageComponent } from '@pages/forgot-password/forgot-password.component';
import { ResetPasswordPageComponent } from '@pages/reset-password/reset-password.component';
import { AdminLayoutComponent } from '@layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from '@pages/admin/dashboard/admin-dashboard.component';
import { AdminAccountComponent } from '@pages/admin/account/admin-account.component';
import { AdminUsersComponent } from '@pages/admin/users/admin-users.component';
import { AdminRolesComponent } from '@pages/admin/roles/admin-roles.component';
import { RolePermissionsComponent } from '@pages/admin/role-permissions/role-permissions.component';
import { RolePermissionsListComponent } from '@pages/admin/roles/permissions/role-permissions-list.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: 'home', component: HomePageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'register', component: RegisterPageComponent },
    { path: 'verify-email', component: VerifyEmailPageComponent },
    { path: 'forgot-password', component: ForgotPasswordPageComponent },
    { path: 'reset-password', component: ResetPasswordPageComponent },
    { path: 'account', component: UserAccountComponent },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'account', component: AdminAccountComponent },
            { path: 'users', component: AdminUsersComponent },
            { path: 'roles', component: AdminRolesComponent },
            { path: 'roles/permissions', component: RolePermissionsListComponent },
            { path: 'role-permissions', component: RolePermissionsComponent }
        ]
    },
    { path: '**', redirectTo: 'home' }
];
