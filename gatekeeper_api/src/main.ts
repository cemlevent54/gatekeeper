import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { checkAndCreateDatabase, getCorsConfig } from './config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Winston logger oluştur - [context][timestamp][level]  -- message
    const logFormat = winston.format.printf(({ level, message, context, timestamp, stack }) => {
      const msg = stack || message;
      return `[${timestamp}][${level}][${context || 'App'}]  -- ${msg}`;
    });

    const winstonLogger = WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            logFormat,
          ),
        }),
      ],
    });

    // NestJS uygulamasını Winston logger ile oluştur
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: winstonLogger });

    // CORS konfigürasyonunu uygula
    app.enableCors(getCorsConfig());

    // Static file serving for uploads
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads/',
    });

    // Global HTTP logging interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());
    // Global prefix
    app.setGlobalPrefix('api');
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
