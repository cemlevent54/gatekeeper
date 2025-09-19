import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { Permission, PermissionSchema } from '../../schemas/permission.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Role, RoleSchema } from '../../schemas/role.schema';
import { PermissionsController } from './controllers/permissions.controller';
import { JwtService } from '../auth/services/jwt/jwt.service';
import { TokenBlacklistService } from '../auth/services/token-blacklist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

// Command Handlers
import { GetPermissionsHandler } from './cqrs/commands/handlers/getpermissions.handler';
import { CreatePermissionHandler } from './cqrs/commands/handlers/createpermission.handler';
import { UpdatePermissionHandler } from './cqrs/commands/handlers/updatepermission.handler';
import { GetUserPermissionsHandler } from './cqrs/commands/handlers/getuserpermissions.handler';
import { GetRolePermissionsHandler } from './cqrs/commands/handlers/getrolepermissions.handler';
import { GetRolePermissionMatrixHandler } from './cqrs/commands/handlers/getrolepermissionmatrix.handler';
import { UpdateRolePermissionsHandler } from './cqrs/commands/handlers/updaterolepermissions.handler';

const CommandHandlers = [
    GetPermissionsHandler,
    CreatePermissionHandler,
    UpdatePermissionHandler,
    GetUserPermissionsHandler,
    GetRolePermissionsHandler,
    GetRolePermissionMatrixHandler,
    UpdateRolePermissionsHandler,
];

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Permission.name, schema: PermissionSchema },
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
        ]),
        CqrsModule,
    ],
    controllers: [PermissionsController],
    providers: [
        ...CommandHandlers,
        JwtService,
        TokenBlacklistService,
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [...CommandHandlers],
})
export class PermissionModule { }
