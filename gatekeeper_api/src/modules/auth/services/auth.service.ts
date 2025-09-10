import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../schemas/user.schema';
import { Role, RoleDocument } from '../../../schemas/role.schema';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from './jwt/jwt.service';
import { EmailVerificationService } from './email-verification.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
        private readonly jwtService: JwtService,
        private readonly emailVerificationService: EmailVerificationService,
    ) { }

    async register(dto: RegisterDto): Promise<{ user: any; reactivated: boolean } | null> {
        if (!dto || !dto.username || !dto.email || !dto.password) {
            return null;
        }

        // 1) Kullanıcı mevcut mu? (email veya username)
        const existing = await this.userModel.findOne({
            $or: [{ email: dto.email.toLowerCase().trim() }, { username: dto.username.trim() }],
        });
        if (existing) {
            // isActive false ise kesinlikle reddet
            if (existing.isActive === false) {
                throw new ForbiddenException('User is blocked');
            }
            // Soft deleted ise ve block değilse reaktivasyon yap
            if (existing.isDeleted === true) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
                existing.isDeleted = false;
                (existing as any).password = hashedPassword;
                (existing as any).username = dto.username.trim();
                (existing as any).email = dto.email.toLowerCase().trim();
                await (existing as any).save();
                const user = await this.userModel.findById(existing._id).select('-password').lean();
                return { user, reactivated: true };
            }
            // Aktif ve silinmemiş kullanıcı -> çakışma
            throw new ConflictException('Username or email already in use');
        }

        // 2) Rolü bul (yoksa NotFound)
        const defaultRoleName = 'user'; // istenirse .env veya sabit
        const role = await this.roleModel.findOne({ name: defaultRoleName }).lean();
        if (!role) {
            throw new NotFoundException(`Default role '${defaultRoleName}' not found`);
        }

        // 3) Şifreyi hashle
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

        // 4) Kullanıcı oluştur
        const created = await this.userModel.create({
            username: dto.username.trim(),
            email: dto.email.toLowerCase().trim(),
            password: hashedPassword,
            role: role._id,
            verifiedAt: null,
        });

        // Email doğrulama için OTP ve token oluştur
        const { otpCode, token } = this.emailVerificationService.createVerificationData(String(created._id));

        // Doğrulama emaili gönder
        const emailSent = await this.emailVerificationService.sendVerificationEmail(
            created.email,
            created.username,
            otpCode,
            token
        );

        if (!emailSent) {
            console.warn(`[AuthService] Email gönderilemedi: ${created.email}`);
        }

        // Parola olmadan geri döndür
        const user = await this.userModel
            .findById(created._id)
            .select('-password')
            .lean();

        return { user, reactivated: false };
    }

    async login(dto: LoginDto): Promise<any> {
        const identifier = dto.usernameOrEmail?.trim().toLowerCase();
        if (!identifier || !dto.password) {
            return null;
        }

        // Kullanıcıyı username veya email ile bul
        const user = await this.userModel.findOne({
            $or: [
                { email: identifier },
                { username: dto.usernameOrEmail?.trim() },
            ],
        }).select('+password');
        if (!user) {
            return null; // unauthorized
        }

        // isActive değilse engelle
        if (user.isActive === false) {
            throw new ForbiddenException('User is blocked');
        }

        // verifiedAt boşsa girişe izin verme
        if (!user.verifiedAt) {
            throw new ForbiddenException('User email is not verified');
        }

        // Soft deleted ise ve block değilse reaktivasyon
        if (user.isDeleted === true) {
            user.isDeleted = false;
            await user.save();
        }

        // Parola kontrolü
        const ok = await bcrypt.compare(dto.password, (user as any).password);
        if (!ok) {
            return null; // unauthorized
        }

        // Başarılı - parola hariç kullanıcıyı döndür
        const safe = await this.userModel.findById(user._id).select('-password').lean();
        const tokenPair = this.jwtService.generateTokenPair({
            sub: String(user._id),
            username: (user as any).username,
            email: (user as any).email,
            role: String((user as any).role),
        });
        return { user: safe, tokens: tokenPair };
    }
}
