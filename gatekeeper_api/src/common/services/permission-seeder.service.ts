import { Injectable, OnModuleInit, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../../schemas/permission.schema';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

// Controller'ları manuel import et
import { UserController } from '../../modules/user/controllers/user.controller';
import { AuthController } from '../../modules/auth/controllers/auth.controller';
import { RolesController } from '../../modules/roles/controllers/roles.controller';
import { PermissionsController } from '../../modules/permissions/controllers/permissions.controller';

@Injectable()
export class PermissionSeederService implements OnModuleInit {
    constructor(
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    ) { }

    async onModuleInit() {
        console.log('[PermissionSeeder] Uygulama başlatılıyor, permission\'lar kontrol ediliyor...');
        await this.seedPermissions();
    }

    /**
     * Controller'lardan gerekli permission'ları çıkarır ve veritabanına ekler
     */
    private async seedPermissions(): Promise<void> {
        try {
            // Controller'lardan gerekli permission'ları al
            const requiredPermissions = await this.getRequiredPermissions();

            console.log(`[PermissionSeeder] Toplam ${requiredPermissions.length} permission kontrol edilecek:`);
            requiredPermissions.forEach(p => console.log(`  - ${p.key}: ${p.description}`));

            let createdCount = 0;
            let updatedCount = 0;
            let existingCount = 0;

            for (const permissionData of requiredPermissions) {
                const result = await this.ensurePermissionExists(permissionData);
                if (result === 'created') createdCount++;
                else if (result === 'updated') updatedCount++;
                else if (result === 'existing') existingCount++;
            }

            console.log(`[PermissionSeeder] İşlem tamamlandı:`);
            console.log(`  - Yeni oluşturulan: ${createdCount}`);
            console.log(`  - Güncellenen: ${updatedCount}`);
            console.log(`  - Zaten mevcut: ${existingCount}`);
            console.log(`  - Toplam: ${createdCount + updatedCount + existingCount}`);
        } catch (error) {
            console.error('[PermissionSeeder] Permission\'lar eklenirken hata:', error);
        }
    }

    /**
     * Controller'lardan otomatik olarak permission'ları çıkarır
     */
    private async getRequiredPermissions(): Promise<{ key: string; description: string }[]> {
        try {
            // Controller'ları keşfet
            console.log('[PermissionSeeder] 🔍 Controller\'lar keşfediliyor...');
            const controllers = this.discoverControllers();

            if (controllers.length === 0) {
                console.warn('[PermissionSeeder] ⚠️ Hiç controller keşfedilemedi!');
                return [];
            }

            console.log(`[PermissionSeeder] 📋 ${controllers.length} controller analiz ediliyor...`);

            // Her controller'ı detaylı analiz et
            const allPermissions: string[] = [];
            for (const controller of controllers) {
                try {
                    const analysis = this.analyzeController(controller);
                    console.log(`[PermissionSeeder] 📋 ${analysis.controllerName}:`);

                    analysis.methods.forEach(method => {
                        if (method.permissions.length > 0) {
                            console.log(`  - ${method.methodName}: ${method.permissions.join(', ')}`);
                        }
                    });

                    allPermissions.push(...analysis.allPermissions);
                } catch (error) {
                    console.error(`[PermissionSeeder] ❌ ${controller.name} analiz edilemedi:`, error);
                }
            }

            // Permission'ları kategorize et
            const categorized = this.categorizePermissions(allPermissions);

            // Her kategori için wildcard permission'ı ekle
            for (const category of Object.keys(categorized)) {
                const wildcardPermission = `${category}.*`;
                if (!allPermissions.includes(wildcardPermission)) {
                    allPermissions.push(wildcardPermission);
                    console.log(`[PermissionSeeder] ➕ Wildcard permission eklendi: ${wildcardPermission}`);
                }
            }

            // Permission'ları description'larla birlikte döndür
            const result = allPermissions.map(permission => ({
                key: permission,
                description: this.generateDescription(permission)
            }));

            console.log(`[PermissionSeeder] 🔍 Toplam ${result.length} permission tespit edildi`);
            return result;
        } catch (error) {
            console.error('[PermissionSeeder] Permission\'lar çıkarılırken hata:', error);
            return [];
        }
    }

    /**
     * Tüm controller'ları keşfeder
     */
    private discoverControllers(): Type<any>[] {
        const controllers: Type<any>[] = [
            UserController,
            AuthController,
            RolesController,
            PermissionsController,
        ];

        console.log(`[PermissionSeeder] ${controllers.length} controller yüklendi:`);
        controllers.forEach(controller => {
            console.log(`  - ${controller.name}`);
        });

        return controllers;
    }

    /**
     * Belirtilen controller'dan tüm permission'ları çıkarır
     */
    private getPermissionsFromController(controllerClass: Type<any>): string[] {
        const permissions: string[] = [];

        // Controller'ın prototype'ındaki tüm method'ları al
        const prototype = controllerClass.prototype;
        const methodNames = Object.getOwnPropertyNames(prototype);

        for (const methodName of methodNames) {
            if (methodName === 'constructor') continue;

            const method = prototype[methodName];
            if (typeof method !== 'function') continue;

            // Method'un metadata'sından permission'ları al
            const methodPermissions = Reflect.getMetadata(PERMISSIONS_KEY, method);
            if (methodPermissions && Array.isArray(methodPermissions)) {
                permissions.push(...methodPermissions);
            }
        }

        return [...new Set(permissions)]; // Duplicate'ları kaldır
    }

    /**
     * Permission'ları kategorize eder (user.*, admin.*, vb.)
     */
    private categorizePermissions(permissions: string[]): { [category: string]: string[] } {
        const categorized: { [category: string]: string[] } = {};

        for (const permission of permissions) {
            const parts = permission.split('.');
            if (parts.length >= 2) {
                const category = parts[0];
                if (!categorized[category]) {
                    categorized[category] = [];
                }
                categorized[category].push(permission);
            }
        }

        return categorized;
    }

    /**
     * Permission'dan açıklama oluşturur
     */
    private generateDescription(permission: string): string {
        const parts = permission.split('.');

        if (parts.length === 1) {
            return `${parts[0]} işlemleri izni`;
        }

        const [category, action] = parts;

        const actionDescriptions: { [key: string]: string } = {
            'view': 'görüntüleme',
            'create': 'oluşturma',
            'edit': 'düzenleme',
            'update': 'güncelleme',
            'delete': 'silme',
            'upload': 'yükleme',
            'download': 'indirme',
            'export': 'dışa aktarma',
            'import': 'içe aktarma',
            'manage': 'yönetme',
            'configure': 'yapılandırma',
            'approve': 'onaylama',
            'reject': 'reddetme',
            'activate': 'aktifleştirme',
            'deactivate': 'pasifleştirme',
        };

        const categoryDescriptions: { [key: string]: string } = {
            'user': 'kullanıcı',
            'admin': 'admin',
            'role': 'rol',
            'permission': 'izin',
            'system': 'sistem',
            'report': 'rapor',
            'audit': 'denetim',
            'backup': 'yedekleme',
            'settings': 'ayarlar',
            'dashboard': 'dashboard',
        };

        const categoryDesc = categoryDescriptions[category] || category;
        const actionDesc = actionDescriptions[action] || action;

        if (action === '*') {
            return `Tüm ${categoryDesc} işlemleri izni`;
        }

        return `${categoryDesc} ${actionDesc} izni`;
    }

    /**
     * Controller'ın tüm method'larını ve permission'larını detaylı olarak analiz eder
     */
    private analyzeController(controllerClass: Type<any>): {
        controllerName: string;
        methods: Array<{
            methodName: string;
            permissions: string[];
        }>;
        allPermissions: string[];
    } {
        const controllerName = controllerClass.name;
        const methods: Array<{ methodName: string; permissions: string[] }> = [];
        const allPermissions: string[] = [];

        const prototype = controllerClass.prototype;
        const methodNames = Object.getOwnPropertyNames(prototype);

        for (const methodName of methodNames) {
            if (methodName === 'constructor') continue;

            const method = prototype[methodName];
            if (typeof method !== 'function') continue;

            const methodPermissions = Reflect.getMetadata(PERMISSIONS_KEY, method) || [];
            methods.push({
                methodName,
                permissions: methodPermissions
            });
            allPermissions.push(...methodPermissions);
        }

        return {
            controllerName,
            methods,
            allPermissions: [...new Set(allPermissions)]
        };
    }

    /**
     * Belirtilen permission'ın veritabanında var olup olmadığını kontrol eder
     * Yoksa oluşturur, varsa günceller
     * @returns 'created' | 'updated' | 'existing'
     */
    private async ensurePermissionExists(permissionData: { key: string; description: string }): Promise<'created' | 'updated' | 'existing'> {
        try {
            const existingPermission = await this.permissionModel.findOne({
                key: permissionData.key,
                isDeleted: false
            });

            if (!existingPermission) {
                // Permission yoksa oluştur
                const newPermission = new this.permissionModel({
                    key: permissionData.key,
                    description: permissionData.description,
                    isActive: true,
                    isDeleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                await newPermission.save();
                console.log(`[PermissionSeeder] ✅ YENİ OLUŞTURULDU: ${permissionData.key} - ${permissionData.description}`);
                return 'created';
            } else {
                // Permission varsa açıklamasını güncelle (eğer farklıysa)
                if (existingPermission.description !== permissionData.description) {
                    existingPermission.description = permissionData.description;
                    (existingPermission as any).updatedAt = new Date();
                    await existingPermission.save();
                    console.log(`[PermissionSeeder] 🔄 GÜNCELLENDİ: ${permissionData.key} - ${permissionData.description}`);
                    return 'updated';
                } else {
                    console.log(`[PermissionSeeder] ✅ ZATEN MEVCUT: ${permissionData.key} - ${permissionData.description}`);
                    return 'existing';
                }
            }
        } catch (error) {
            console.error(`[PermissionSeeder] ❌ HATA (${permissionData.key}):`, error);
            throw error;
        }
    }

    /**
     * Manuel olarak permission eklemek için public method
     */
    public async addPermission(key: string, description: string): Promise<void> {
        await this.ensurePermissionExists({ key, description });
    }

    /**
     * Tüm permission'ları yeniden kontrol etmek için
     */
    public async reseedPermissions(): Promise<void> {
        console.log('[PermissionSeeder] Permission\'lar yeniden ekleniyor...');
        await this.seedPermissions();
    }
}
