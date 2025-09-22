import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../../../schemas/permission.schema';

@Injectable()
export class PermissionRepository {
    constructor(
        @InjectModel(Permission.name) private readonly permissionModel: Model<PermissionDocument>,
    ) { }

    async findAllActiveSorted() {
        return this.permissionModel.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    }

    async findByIdLean(id: string) {
        return this.permissionModel.findById(id).lean();
    }

    async create(doc: Partial<Permission>) {
        return this.permissionModel.create(doc);
    }

    async updateById(id: string, update: Record<string, any>) {
        return this.permissionModel.findByIdAndUpdate(id, update, { new: true }).lean();
    }
}


