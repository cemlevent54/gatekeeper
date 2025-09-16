import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { RegisterCommandHandler } from './cqrs/commands/handlers/registercommand.handler';
import { LoginCommandHandler } from './cqrs/commands/handlers/logincommand.handler';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';
import { Role, RoleSchema } from '../../schemas/role.schema';
import { JwtService } from './services/jwt/jwt.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { VerifyEmailCommandHandler } from './cqrs/commands/handlers/verifyemailcommand.handler';
import { ForgotPasswordCommandHandler } from './cqrs/commands/handlers/forgotpasswordcommand.handler';
import { ResetPasswordCommandHandler } from './cqrs/commands/handlers/resetpasswordcommand.handler';
import { LogoutCommandHandler } from './cqrs/commands/handlers/logoutcommand.handler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        CqrsModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Role.name, schema: RoleSchema },
        ]),
        MailModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, RegisterCommandHandler, LoginCommandHandler, JwtService, EmailVerificationService, PasswordResetService, TokenBlacklistService, VerifyEmailCommandHandler, ForgotPasswordCommandHandler, ResetPasswordCommandHandler, LogoutCommandHandler, JwtAuthGuard],
    exports: [JwtService, JwtAuthGuard, TokenBlacklistService],
})
export class AuthModule { }