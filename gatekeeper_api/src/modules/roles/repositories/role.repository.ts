import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../../schemas/role.schema';

@Injectable()
export class RoleRepository {
    constructor(
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    ) { }

    async findAllActiveSorted() {
        return this.roleModel.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
    }

    async findById(id: string) {
        return this.roleModel.findById(id);
    }

    async findByIdLean(id: string) {
        return this.roleModel.findById(id).lean();
    }

    async findByNameActive(name: string) {
        return this.roleModel.findOne({ name, isDeleted: false });
    }

    async create(doc: Partial<Role>) {
        const created = new this.roleModel(doc);
        return created.save();
    }

    async save(role: any) {
        return role.save();
    }
}


