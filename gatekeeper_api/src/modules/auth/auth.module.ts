import { Module } from '@nestjs/common';
// import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
// CQRS kaldırıldı
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';
import { Role, RoleSchema } from '../../schemas/role.schema';
import { JwtService } from './services/jwt/jwt.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
// CQRS kaldırıldı
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { MailModule } from '../mail/mail.module';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
        ]),
        MailModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtService, EmailVerificationService, PasswordResetService, TokenBlacklistService, JwtAuthGuard, RolesGuard, UserRepository, RoleRepository],
    exports: [JwtService, JwtAuthGuard, RolesGuard, TokenBlacklistService],
})
export class AuthModule { }