import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../schemas/user.schema';

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async findByEmailOrUsername(emailLower: string, usernameRaw: string) {
        return this.userModel.findOne({
            $or: [
                { email: emailLower },
                { username: usernameRaw },
            ],
        });
    }

    async findByIdLeanWithoutPassword(id: string) {
        return this.userModel.findById(id).select('-password').lean();
    }

    async findByIdAndUpdate(id: string, update: Record<string, any>) {
        return this.userModel.findByIdAndUpdate(id, update);
    }

    async create(doc: Partial<User>) {
        return this.userModel.create(doc);
    }

    async save(document: any) {
        return document.save();
    }

    async findOneSelectPassword(criteria: Record<string, any>) {
        return this.userModel.findOne(criteria).select('+password');
    }

    async findByIdPopulateRoleLeanWithoutPassword(id: string) {
        return this.userModel.findById(id).select('-password').populate('role', 'name').lean();
    }
}


