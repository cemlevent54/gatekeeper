import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { ProductCategory, ProductCategorySchema } from '../../schemas/productCategory.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Role, RoleSchema } from '../../schemas/role.schema';
import { Permission, PermissionSchema } from '../../schemas/permission.schema';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { ProductRepository } from './repositories/product.repository';
import { AuthModule } from '../auth/auth.module';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
            { name: ProductCategory.name, schema: ProductCategorySchema },
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
            { name: Permission.name, schema: PermissionSchema }
        ]),
        forwardRef(() => AuthModule)
    ],
    controllers: [ProductController],
    providers: [ProductService, ProductRepository, PermissionsGuard],
    exports: [ProductService]
})
export class ProductModule { }
