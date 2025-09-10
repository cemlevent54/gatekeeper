import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export interface DatabaseConfig {
    uri: string;
    options: {
        maxPoolSize: number;
        serverSelectionTimeoutMS: number;
        socketTimeoutMS: number;
    };
}

export const getDatabaseConfig = (configService: ConfigService): DatabaseConfig => {
    const host = configService.get<string>('MONGO_HOST');
    const port = configService.get<string>('MONGO_PORT');
    const username = configService.get<string>('MONGO_ROOT_USERNAME');
    const password = configService.get<string>('MONGO_ROOT_PASSWORD');
    const database = configService.get<string>('MONGO_DATABASE');

    // Environment değişkenlerini kontrol et
    if (!host || !port || !username || !password || !database) {
        throw new Error('MongoDB konfigürasyon değişkenleri eksik. Lütfen .env dosyasını kontrol edin.');
    }

    // MongoDB bağlantı URI'sini oluştur
    const uri = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;

    return {
        uri,
        options: {
            maxPoolSize: 10, // Maksimum bağlantı havuzu boyutu
            serverSelectionTimeoutMS: 5000, // Sunucu seçim timeout (5 saniye)
            socketTimeoutMS: 45000, // Socket timeout (45 saniye)
        },
    };
};

export const createDatabaseModule = (configService: ConfigService) => {
    const config = getDatabaseConfig(configService);
    return MongooseModule.forRoot(config.uri, config.options);
};

export const createDatabaseIfNotExists = async (configService: ConfigService): Promise<boolean> => {
    const config = getDatabaseConfig(configService);

    try {
        const mongoose = require('mongoose');

        // Bağlantıyı kur (yalnızca okuma/kontrol için)
        await mongoose.connect(config.uri, config.options);

        const databaseName = configService.get<string>('MONGO_DATABASE');

        // Native MongoDB client üzerinden tüm veritabanlarını listele
        const client = mongoose.connection.getClient();
        const adminDb = client.db().admin();
        const { databases } = await adminDb.listDatabases();

        const exists = databases.some((d: { name: string }) => d.name === databaseName);
        if (exists) {
            console.log(`✅ Veritabanı '${databaseName}' zaten mevcut`);
            return false;
        }

        // Mevcut değilse oluşturmak için hedef DB'de geçici bir koleksiyon kullan
        const targetDb = client.db(databaseName);
        const initCollection = targetDb.collection('_init');
        await initCollection.insertOne({
            _id: 'init',
            created: new Date(),
            message: 'Veritabanı başlatıldı'
        });
        console.log(`✅ Veritabanı '${databaseName}' başarıyla oluşturuldu`);
        await initCollection.deleteOne({ _id: 'init' });
        return true;

    } catch (error) {
        throw new Error(`Veritabanı oluşturulurken hata: ${error.message}`);
    }
};

export const DATABASE_CONFIG_TOKEN = 'DATABASE_CONFIG';
