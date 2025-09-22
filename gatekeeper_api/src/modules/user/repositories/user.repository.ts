import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../schemas/user.schema';

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async findByIdLeanWithRole(id: string) {
        return this.userModel.findById(id).populate('role', 'name').lean();
    }

    async findById(id: string) {
        return this.userModel.findById(id);
    }

    async findManyActiveSorted() {
        return this.userModel.find({ isDeleted: false })
            .select('-password -refreshToken')
            .populate('role', 'name')
            .sort({ createdAt: -1 })
            .lean();
    }
}


