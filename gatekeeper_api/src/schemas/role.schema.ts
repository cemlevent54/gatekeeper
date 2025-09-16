import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true, id: true })
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

}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Virtual: users (one-to-many)
RoleSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'role',
});