import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../../schemas/role.schema';

@Injectable()
export class RoleRepository {
    constructor(
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    ) { }

    async findByIdWithPermissionsLean(id: string) {
        return this.roleModel.findById(id).populate('permissions').lean();
    }

    async updatePermissions(id: string, permissionIds: string[]) {
        return this.roleModel.findByIdAndUpdate(id, { permissions: permissionIds }, { new: true }).lean();
    }

    async findAllActiveWithPermissionsLean() {
        return this.roleModel
            .find({ isDeleted: false })
            .populate('permissions')
            .sort({ createdAt: -1 })
            .lean();
    }
}


