import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../../schemas/product.schema';

@Injectable()
export class ProductRepository {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>
    ) { }

    async create(productData: any): Promise<ProductDocument> {
        const product = new this.productModel(productData);
        return product.save();
    }

    async findById(id: string): Promise<ProductDocument | null> {
        return this.productModel.findById(id).populate('category').exec();
    }

    async findAll(isDeleted: boolean = false): Promise<ProductDocument[]> {
        return this.productModel.find({ isDeleted }).populate('category').exec();
    }

    async update(id: string, updateData: any): Promise<ProductDocument | null> {
        return this.productModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('category').exec();
    }

    async softDelete(id: string): Promise<ProductDocument | null> {
        return this.productModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        ).populate('category').exec();
    }

    async findByName(name: string): Promise<ProductDocument | null> {
        return this.productModel.findOne({ name }).exec();
    }

    async findBySlug(slug: string): Promise<ProductDocument | null> {
        return this.productModel.findOne({ slug }).exec();
    }

    async findByCategory(categoryId: string): Promise<ProductDocument[]> {
        return this.productModel.find({
            category: new Types.ObjectId(categoryId),
            isDeleted: false
        }).populate('category').exec();
    }
}
