import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { getDatabaseConfig, DatabaseConfig, createDatabaseIfNotExists } from './database';
import { getCorsConfig } from './cors';

const logger = new Logger('DatabaseTest');

export class DatabaseConnectionTester {
    private static instance: DatabaseConnectionTester;
    private config: DatabaseConfig | null = null;
    private isConnected = false;

    private constructor() { }

    public static getInstance(): DatabaseConnectionTester {
        if (!DatabaseConnectionTester.instance) {
            DatabaseConnectionTester.instance = new DatabaseConnectionTester();
        }
        return DatabaseConnectionTester.instance;
    }

    public initialize(configService: ConfigService): void {
        try {
            this.config = getDatabaseConfig(configService);
            logger.log('Veritabanı konfigürasyonu başarıyla yüklendi');
            logger.debug(`MongoDB URI: ${this.config.uri.replace(/\/\/.*@/, '//***:***@')}`);
        } catch (error) {
            logger.error('Veritabanı konfigürasyonu yüklenirken hata oluştu:', error);
            throw error;
        }
    }

    public getConfig(): DatabaseConfig {
        if (!this.config) {
            throw new Error('Veritabanı konfigürasyonu henüz başlatılmamış');
        }
        return this.config;
    }

    public async testConnection(): Promise<boolean> {
        if (!this.config) {
            logger.error('Veritabanı konfigürasyonu bulunamadı');
            return false;
        }

        try {
            const mongoose = require('mongoose');

            // Mevcut bağlantıyı kontrol et
            if (mongoose.connection.readyState === 1) {
                logger.log('MongoDB bağlantısı zaten aktif');
                this.isConnected = true;
                return true;
            }

            // Bağlantı testi
            await mongoose.connect(this.config.uri, this.config.options);

            // Bağlantı durumunu kontrol et
            if (mongoose.connection.readyState === 1) {
                logger.log('✅ MongoDB bağlantısı başarıyla test edildi');
                this.isConnected = true;
                return true;
            } else {
                logger.error('❌ MongoDB bağlantısı başarısız');
                this.isConnected = false;
                return false;
            }
        } catch (error) {
            logger.error('❌ MongoDB bağlantı testi başarısız:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    public async checkAndCreateDatabase(configService: ConfigService): Promise<{ created: boolean; tested: boolean }> {
        try {
            logger.log('Veritabanı kontrolü başlatılıyor...');

            // Veritabanını kontrol et ve gerekirse oluştur
            const created = await createDatabaseIfNotExists(configService);

            if (created) {
                logger.log('🆕 Gatekeeper veritabanı oluşturuldu');
            } else {
                logger.log('✅ Gatekeeper veritabanı zaten mevcut');
            }

            // Bağlantıyı test et
            logger.log('Bağlantı testi yapılıyor...');
            const tested = await this.testConnection();

            return { created, tested };
        } catch (error) {
            logger.error('❌ Veritabanı kontrolü ve oluşturma işlemi başarısız:', error.message);
            logger.error('Hata detayı:', error);
            return { created: false, tested: false };
        }
    }

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    public async disconnect(): Promise<void> {
        try {
            const mongoose = require('mongoose');
            if (mongoose.connection.readyState === 1) {
                await mongoose.disconnect();
                logger.log('MongoDB bağlantısı kapatıldı');
                this.isConnected = false;
            }
        } catch (error) {
            logger.error('MongoDB bağlantısı kapatılırken hata oluştu:', error);
        }
    }
}

export const testDatabaseConnection = async (configService: ConfigService): Promise<boolean> => {
    const dbTester = DatabaseConnectionTester.getInstance();

    // Önce konfigürasyonu başlat
    dbTester.initialize(configService);

    return await dbTester.testConnection();
};

export const checkAndCreateDatabase = async (configService: ConfigService): Promise<{ created: boolean; tested: boolean }> => {
    const dbTester = DatabaseConnectionTester.getInstance();

    // Önce konfigürasyonu başlat
    dbTester.initialize(configService);

    return await dbTester.checkAndCreateDatabase(configService);
};

// CORS konfigürasyonunu export et
export { getCorsConfig };