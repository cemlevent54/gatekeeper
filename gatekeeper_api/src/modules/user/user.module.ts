import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { GetAllUsersCommandHandler } from './cqrs/commands/handlers/getalluserscommand.handler';
import { GetUserCommandHandler } from './cqrs/commands/handlers/getusercommand.handler';
import { UpdateUserCommandHandler } from './cqrs/commands/handlers/updateusercommand.handler';
import { DeleteUserCommandHandler } from './cqrs/commands/handlers/deleteusercommand.handler';
import { User, UserSchema } from '../../schemas/user.schema';
import { Role, RoleSchema } from '../../schemas/role.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
        ]),
        AuthModule,
    ],
    controllers: [UserController],
    providers: [
        UserService,
        GetAllUsersCommandHandler,
        GetUserCommandHandler,
        UpdateUserCommandHandler,
        DeleteUserCommandHandler,
    ],
    exports: [UserService],
})
export class UserModule { }
