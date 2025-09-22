import 'dotenv/config';
import mongoose from 'mongoose';
import { RoleSchema } from '../schemas/role.schema';
import { PermissionSchema } from '../schemas/permission.schema';

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
        const permissionKey = 'user.view';

        console.log(`🔎 '${roleName}' rolü aranıyor...`);
        const role = await RoleModel.findOne({ name: roleName, isDeleted: { $ne: true } });
        if (!role) {
            throw new Error(`'${roleName}' rolü bulunamadı. Önce rolü oluşturun.`);
        }

        console.log(`🔎 '${permissionKey}' izni aranıyor...`);
        let permission = await PermissionModel.findOne({ key: permissionKey });
        if (!permission) {
            console.log(`🆕 '${permissionKey}' izni oluşturuluyor...`);
            permission = await PermissionModel.create({ key: permissionKey, description: 'Kullanıcıları görüntüleme izni' });
        }

        const permId = permission._id;
        const hasAlready = Array.isArray((role as any).permissions) && (role as any).permissions.some((p: any) => String(p) === String(permId));
        if (hasAlready) {
            console.log(`✅ '${roleName}' rolünde '${permissionKey}' izni zaten var.`);
        } else {
            console.log(`➕ '${permissionKey}' izni '${roleName}' rolüne ekleniyor...`);
            (role as any).permissions = [...(role as any).permissions || [], permId];
            await role.save();
            console.log(`✅ Eklendi.`);
        }

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


