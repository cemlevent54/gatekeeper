import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../../schemas/role.schema';

@Injectable()
export class RoleRepository {
    constructor(
        @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    ) { }

    async findByNameLean(name: string) {
        return this.roleModel.findOne({ name }).lean();
    }
}


