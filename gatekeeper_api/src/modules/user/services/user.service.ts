import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetUserDto } from '../dto/get-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly roleRepository: RoleRepository,
    ) { }

    async getUserById(userId: string, requestingUserId: string): Promise<GetUserDto> {
        // Admin kontrolü - admin kullanıcılar herkesi görebilir
        const requestingUser = await this.userRepository.findByIdLeanWithRole(requestingUserId);
        if (!requestingUser) {
            throw new ForbiddenException('Kullanıcı bulunamadı');
        }

        const isAdmin = (requestingUser.role as any)?.name === 'admin';

        // Admin değilse sadece kendi bilgilerini görebilir
        if (!isAdmin && userId !== requestingUserId) {
            throw new ForbiddenException('Bu kullanıcının bilgilerini görme yetkiniz yok');
        }

        const user = await this.userRepository.findByIdLeanWithRole(userId);

        if (!user) {
            throw new NotFoundException('Kullanıcı bulunamadı');
        }

        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: (user.role as any)?.name || 'user',
            isActive: user.isActive,
            isDeleted: user.isDeleted,
            verifiedAt: user.verifiedAt,
            createdAt: (user as any).createdAt,
            updatedAt: (user as any).updatedAt,
            lastLoginAt: user.lastLoginAt,
            profileImage: user.profileImage,
        };
    }

    async updateUser(userId: string, updateData: UpdateUserDto, requestingUserId: string): Promise<GetUserDto> {
        // Admin kontrolü - admin kullanıcılar herkesi güncelleyebilir
        const requestingUser = await this.userRepository.findByIdLeanWithRole(requestingUserId);
        if (!requestingUser) {
            throw new ForbiddenException('Kullanıcı bulunamadı');
        }

        const isAdmin = (requestingUser.role as any)?.name === 'admin';

        // Admin değilse sadece kendi bilgilerini güncelleyebilir
        if (!isAdmin && userId !== requestingUserId) {
            throw new ForbiddenException('Bu kullanıcının bilgilerini güncelleme yetkiniz yok');
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('Kullanıcı bulunamadı');
        }

        // Güncellenebilir alanları güncelle
        if (updateData.firstName !== undefined) {
            user.firstName = updateData.firstName;
        }
        if (updateData.lastName !== undefined) {
            user.lastName = updateData.lastName;
        }
        if (updateData.email !== undefined) {
            user.email = updateData.email;
        }
        if (updateData.profileImage !== undefined) {
            user.profileImage = updateData.profileImage;
        }
        if (updateData.isActive !== undefined) {
            user.isActive = updateData.isActive;
        }
        if (updateData.role !== undefined) {
            // Role ID'yi bul ve güncelle
            const role = await this.roleRepository.findByNameLean(updateData.role as any);
            if (role) {
                user.role = role._id;
            }
        }

        await user.save();

        // Güncellenmiş kullanıcı bilgilerini döndür
        return this.getUserById(userId, requestingUserId);
    }

    async deleteUser(userId: string, requestingUserId: string): Promise<{ message: string }> {
        // Admin kontrolü - admin kullanıcılar herkesi silebilir
        const requestingUser = await this.userRepository.findByIdLeanWithRole(requestingUserId);
        if (!requestingUser) {
            throw new ForbiddenException('Kullanıcı bulunamadı');
        }

        const isAdmin = (requestingUser.role as any)?.name === 'admin';

        // Admin değilse sadece kendi hesabını silebilir
        if (!isAdmin && userId !== requestingUserId) {
            throw new ForbiddenException('Bu kullanıcının hesabını silme yetkiniz yok');
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('Kullanıcı bulunamadı');
        }

        // Soft delete - kullanıcıyı silmek yerine sadece isDeleted flag'ini true yap
        // isActive'i false yapmıyoruz ki kullanıcı tekrar kayıt olabilsin
        user.isDeleted = true;
        await user.save();

        return { message: 'Hesabınız başarıyla silindi' };
    }

    async getAllUsers(requestingUserId: string): Promise<GetUserDto[]> {
        // Admin kontrolü - sadece admin kullanıcılar tüm kullanıcıları görebilir
        const requestingUser = await this.userRepository.findByIdLeanWithRole(requestingUserId);
        if (!requestingUser || (requestingUser.role as any)?.name !== 'admin') {
            throw new ForbiddenException('Bu işlem için admin yetkisi gereklidir');
        }

        const users = await this.userRepository.findManyActiveSorted();

        return users.map(user => ({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: (user.role as any)?.name || 'user',
            isActive: user.isActive,
            isDeleted: user.isDeleted,
            verifiedAt: user.verifiedAt,
            createdAt: (user as any).createdAt,
            updatedAt: (user as any).updatedAt,
            lastLoginAt: user.lastLoginAt,
            profileImage: user.profileImage,
        }));
    }
}
