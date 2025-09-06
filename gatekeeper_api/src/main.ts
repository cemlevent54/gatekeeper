import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { checkAndCreateDatabase } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // NestJS uygulamasını oluştur
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // MongoDB veritabanını kontrol et ve gerekirse oluştur
    logger.log('MongoDB veritabanı kontrol ediliyor...');
    const { created, tested } = await checkAndCreateDatabase(configService);

    if (created && tested) {
      logger.log('🆕 Veritabanı oluşturuldu ve test edildi');
    } else if (!created && tested) {
      logger.log('✅ Mevcut veritabanı başarıyla test edildi');
    } else if (created && !tested) {
      logger.warn('⚠️  Veritabanı oluşturuldu ama test başarısız');
    } else {
      logger.warn('⚠️  Veritabanı işlemleri başarısız');
    }

    // Uygulamayı başlat
    const port = configService.get<number>('PORT', 3000);
    await app.listen(port);

    logger.log(`🚀 Gatekeeper API ${port} portunda çalışıyor`);
    logger.log(`📊 MongoDB durumu: ${tested ? 'Bağlı' : 'Bağlantısız'}`);
    if (created) {
      logger.log(`🆕 Veritabanı durumu: Yeni oluşturuldu`);
    } else {
      logger.log(`✅ Veritabanı durumu: Mevcut`);
    }

  } catch (error) {
    logger.error('❌ Uygulama başlatılırken hata oluştu:', error);
    process.exit(1);
  }
}

bootstrap();
