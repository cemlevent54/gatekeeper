import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';


export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, id: true })
export class User {
    // username -> type string
    @Prop({ type: String, required: true, unique: true, trim: true })
    username: string;

    // firstName -> type string
    @Prop({ type: String, required: false, trim: true })
    firstName: string;

    // lastName -> type string
    @Prop({ type: String, required: false, trim: true })
    lastName: string;

    // email -> type string
    @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
    email: string;

    // password -> type string
    @Prop({ type: String, required: true, select: false })
    password: string;

    // isDeleted -> type boolean
    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

    // isActive -> type boolean
    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    // role -> reference to Role
    @Prop({ type: Types.ObjectId, ref: 'Role', required: true, index: true })
    role: Types.ObjectId;

    // verifiedAt -> type date or null
    @Prop({ type: Date, default: null })
    verifiedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);