import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { RegisterCommandHandler } from './cqrs/commands/handlers/registercommand.handler';
import { LoginCommandHandler } from './cqrs/commands/handlers/logincommand.handler';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';
import { Role, RoleSchema } from '../../schemas/role.schema';

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
        ]),
    ],
    controllers: [AuthController],
    providers: [AuthService, RegisterCommandHandler, LoginCommandHandler],
})
export class AuthModule { }
