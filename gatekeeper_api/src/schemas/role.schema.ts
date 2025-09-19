import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Permission } from './permission.schema';
import { TimezoneUtil } from '../common/utils/timezone.util';


export type RoleDocument = HydratedDocument<Role>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        currentTime: () => TimezoneUtil.getMongoTimestamp()
    },
    id: true
})
export class Role {
    // name -> type string
    @Prop({ type: String, required: true, unique: true, trim: true })
    name: string;

    // description -> type string
    @Prop({ type: String, default: '' })
    description: string;

    // isActive -> type boolean
    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    // isDeleted -> type boolean
    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    // permissions -> reference to Permission
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }] })
    permissions: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Virtual: users (one-to-many)
RoleSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'role',
});