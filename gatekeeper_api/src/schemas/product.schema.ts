import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TimezoneUtil } from '../common/utils/timezone.util';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        currentTime: () => TimezoneUtil.getMongoTimestamp()
    },
    id: true
})
export class Product {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: String, required: true, unique: true })
    slug: string;

    @Prop({ type: Number, required: true })
    price: number;

    @Prop({ type: String, required: true })
    photo_url: string;

    @Prop({ type: Types.ObjectId, ref: 'ProductCategory', required: true })
    category: Types.ObjectId;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);