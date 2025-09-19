import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Gerekli permission'ları decorator'dan al
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Eğer permission gereksinimi yoksa, erişime izin ver
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        // Request'ten kullanıcı bilgilerini al
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Kullanıcı bilgisi bulunamadı');
        }

        // Kullanıcının permission'larını al
        const userPermissions = await this.getUserPermissions(user);

        // Permission kontrolü yap
        const hasPermission = this.checkPermissions(requiredPermissions, userPermissions);

        if (!hasPermission) {
            throw new ForbiddenException(
                `Bu işlem için gerekli yetkiye sahip değilsiniz. Gerekli: ${requiredPermissions.join(', ')}`
            );
        }

        return true;
    }

    /**
     * Kullanıcının permission'larını getirir
     * JWT token'dan user ID'yi alıp veritabanından kullanıcı bilgilerini çeker
     */
    private async getUserPermissions(user: any): Promise<string[]> {
        try {
            // JWT token'dan user ID'yi al
            const userId = user.sub || user.id;

            if (!userId) {
                return [];
            }

            // Kullanıcıyı rolü ve permission'ları ile birlikte getir
            const userWithPermissions = await this.userModel
                .findById(userId)
                .populate({
                    path: 'role',
                    populate: {
                        path: 'permissions'
                    }
                })
                .lean();

            if (!userWithPermissions || !userWithPermissions.role || !(userWithPermissions.role as any).permissions) {
                return [];
            }

            // Permission'ları string array olarak döndür
            return (userWithPermissions.role as any).permissions.map((permission: any) => permission.key);
        } catch (error) {
            console.error('Permission alınırken hata:', error);
            return [];
        }
    }

    /**
     * Permission kontrolü yapar
     * Wildcard (*) desteği ile
     */
    private checkPermissions(requiredPermissions: string[], userPermissions: string[]): boolean {
        return requiredPermissions.some(required => {
            // Wildcard permission kontrolü
            if (required.endsWith('.*')) {
                const prefix = required.slice(0, -2); // 'user.*' -> 'user'
                return userPermissions.some(userPerm =>
                    userPerm === required || // Tam eşleşme
                    userPerm.startsWith(prefix + '.') || // Prefix eşleşmesi
                    userPerm === prefix // Tam prefix eşleşmesi
                );
            }

            // Normal permission kontrolü
            return userPermissions.includes(required);
        });
    }
}
