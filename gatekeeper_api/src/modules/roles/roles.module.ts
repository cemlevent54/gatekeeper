import { Module } from '@nestjs/common';
// import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';
import { Role, RoleSchema } from '../../schemas/role.schema';
import { User, UserSchema } from '../../schemas/user.schema';
// CQRS kaldırıldı
import { RoleRepository } from './repositories/role.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        // CqrsModule,
        MongooseModule.forFeature([
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
    ],
    controllers: [RolesController],
    providers: [
        RolesService,
        RoleRepository,

    ],
    exports: [RolesService],
})
export class RolesModule { }
