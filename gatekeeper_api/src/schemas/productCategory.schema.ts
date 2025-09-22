import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TimezoneUtil } from '../common/utils/timezone.util';

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

@Schema({
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        currentTime: () => TimezoneUtil.getMongoTimestamp()
    },
    id: true
})
export class ProductCategory {

    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: String, required: true, unique: true })
    slug: string;

    @Prop({ type: String, default: '' })
    description: string;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;

    @Prop({ type: Boolean, default: false })
    isDeleted: boolean;

}

export const ProductCategorySchema = SchemaFactory.createForClass(ProductCategory);