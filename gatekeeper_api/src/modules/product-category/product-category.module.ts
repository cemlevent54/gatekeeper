import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductCategory, ProductCategorySchema } from '../../schemas/productCategory.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { ProductCategoryController } from './controllers/product-category.controller';
import { ProductCategoryService } from './services/product-category.service';
import { ProductCategoryRepository } from './repositories/product-category.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ProductCategory.name, schema: ProductCategorySchema },
            { name: User.name, schema: UserSchema }
        ]),
        forwardRef(() => AuthModule)
    ],
    controllers: [ProductCategoryController],
    providers: [ProductCategoryService, ProductCategoryRepository],
    exports: [ProductCategoryService]
})
export class ProductCategoryModule { }

