import 'dotenv/config';
import mongoose from 'mongoose';
import { RoleSchema } from '../schemas/role.schema';

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
        await RoleModel.init(); // indexler

        const roleName = 'admin';
        console.log(`🔎 '${roleName}' rolü kontrol ediliyor...`);
        const existing = await RoleModel.findOne({ name: roleName }).lean();
        if (existing) {
            console.log(`✅ '${roleName}' rolü zaten mevcut (id: ${existing._id})`);
            return;
        }

        console.log(`🆕 '${roleName}' rolü oluşturuluyor...`);
        const created = await RoleModel.create({ name: roleName });
        console.log(`✅ Rol oluşturuldu (id: ${created._id})`);
    } catch (err: any) {
        console.error('❌ Admin rolü oluşturulurken hata:', err?.message || err);
        process.exitCode = 1;
    } finally {
        try {
            await mongoose.disconnect();
            console.log('🔌 MongoDB bağlantısı kapatıldı');
        } catch { }
    }
}

main();


