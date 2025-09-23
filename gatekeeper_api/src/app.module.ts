import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { createDatabaseModule } from './config/database';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionModule } from './modules/permissions/permission.module';
import { ProductCategoryModule } from './modules/product-category/product-category.module';
import { ProductModule } from './modules/product/product.module';
import { HealthController } from './health/health.controller';
import { PermissionSeederService } from './common/services/permission-seeder.service';
import { Permission, PermissionSchema } from './schemas/permission.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    createDatabaseModule(new ConfigService()),
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
    ]),
    AuthModule,
    MailModule,
    UserModule,
    RolesModule,
    PermissionModule,
    ProductCategoryModule,
    ProductModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, PermissionSeederService],
})
export class AppModule { }
