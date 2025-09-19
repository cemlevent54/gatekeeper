import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TimezoneUtil } from '../common/utils/timezone.util';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        currentTime: () => TimezoneUtil.getMongoTimestamp()
    },
    id: true
})
export class Permission {
    // key -> örn: 'user.create', 'role.assign', 'role.create'
    @Prop({ type: String, required: true, unique: true, trim: true })
    key: string;

    // description -> izin açıklaması
    @Prop({ type: String, default: '' })
    description: string;

    // isActive -> izin aktif mi
    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    // isDeleted -> izin silindi mi
    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

}

export const PermissionSchema = SchemaFactory.createForClass(Permission);