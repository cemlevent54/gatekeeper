import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { CqrsModule } from '@nestjs/cqrs';
import { Permission, PermissionSchema } from '../../schemas/permission.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Role, RoleSchema } from '../../schemas/role.schema';
import { PermissionsController } from './controllers/permissions.controller';
import { JwtService } from '../auth/services/jwt/jwt.service';
import { TokenBlacklistService } from '../auth/services/token-blacklist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { PermissionsService } from './services/permissions.service';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Permission.name, schema: PermissionSchema },
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
        ]),
        // CqrsModule,
    ],
    controllers: [PermissionsController],
    providers: [
        PermissionsService,
        PermissionRepository,
        RoleRepository,
        JwtService,
        TokenBlacklistService,
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [PermissionsService],
})
export class PermissionModule { }
