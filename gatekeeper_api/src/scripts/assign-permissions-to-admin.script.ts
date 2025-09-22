import 'dotenv/config';
import mongoose from 'mongoose';
import { RoleSchema } from '../schemas/role.schema';
import { PermissionSchema } from '../schemas/permission.schema';

// Eklemek istediğiniz izin anahtarları
const PERMISSION_KEYS = [
    'permission.view',
    'permission.*',
];

async function main() {
    try {
        const host = process.env.MONGO_HOST;
        const port = process.env.MONGO_PORT;
        const username = process.env.MONGO_ROOT_USERNAME;
        const password = process.env.MONGO_ROOT_PASSWORD;
        const database = process.env.MONGO_DATABASE;

        if (!host || !port || !username || !password || !database) {
            throw new Error('MongoDB konfigürasyon değişkenleri eksik. Lütfen .env dosyasını kontrol edin.');
        }

        const uri = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;

        console.log('🔌 MongoDB bağlantısı kuruluyor...');
        await mongoose.connect(uri, {
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        } as any);

        const RoleModel = mongoose.model('Role', RoleSchema);
        const PermissionModel = mongoose.model('Permission', PermissionSchema);
        await RoleModel.init();
        await PermissionModel.init();

        const roleName = 'admin';
        console.log(`🔎 '${roleName}' rolü aranıyor...`);
        const role = await RoleModel.findOne({ name: roleName, isDeleted: { $ne: true } });
        if (!role) {
            throw new Error(`'${roleName}' rolü bulunamadı. Önce rolü oluşturun.`);
        }

        const currentPermIds = new Set(((role as any).permissions || []).map((p: any) => String(p)));

        for (const key of PERMISSION_KEYS) {
            console.log(`🔎 '${key}' izni kontrol ediliyor...`);
            let perm = await PermissionModel.findOne({ key });
            if (!perm) {
                console.log(`🆕 '${key}' izni oluşturuluyor...`);
                perm = await PermissionModel.create({ key, description: `${key} izni` });
            }

            const permId = String(perm._id);
            if (!currentPermIds.has(permId)) {
                console.log(`➕ '${key}' izni admin rolüne ekleniyor...`);
                (role as any).permissions = [...(role as any).permissions || [], perm._id];
                currentPermIds.add(permId);
            } else {
                console.log(`✅ '${key}' izni zaten admin rolünde mevcut.`);
            }
        }

        await role.save();
        console.log('✅ İşlem tamamlandı. Gerekli izinler admin rolüne eklendi.');

    } catch (err: any) {
        console.error('❌ İzin atama hatası:', err?.message || err);
        process.exitCode = 1;
    } finally {
        try {
            await mongoose.disconnect();
            console.log('🔌 MongoDB bağlantısı kapatıldı');
        } catch { }
    }
}

main();


