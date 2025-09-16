import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';
import { Role, RoleSchema } from '../../schemas/role.schema';
import { GetAllRolesCommandHandler } from './cqrs/commands/handlers/getallrolescommand.handler';
import { UpdateRoleCommandHandler } from './cqrs/commands/handlers/updaterolecommand.handler';
import { DeleteRoleCommandHandler } from './cqrs/commands/handlers/deleterolecommand.handler';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema },
        ]),
        AuthModule,
    ],
    controllers: [RolesController],
    providers: [
        RolesService,
        GetAllRolesCommandHandler,
        UpdateRoleCommandHandler,
        DeleteRoleCommandHandler,
    ],
    exports: [RolesService],
})
export class RolesModule { }
