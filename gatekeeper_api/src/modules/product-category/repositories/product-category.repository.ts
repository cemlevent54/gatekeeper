import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductCategory, ProductCategoryDocument } from '../../../schemas/productCategory.schema';
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dto/update-product-category.dto';

@Injectable()
export class ProductCategoryRepository {
    constructor(
        @InjectModel(ProductCategory.name) private readonly categoryModel: Model<ProductCategoryDocument>
    ) { }

    async createCategory(payload: CreateProductCategoryDto) {
        const created = await this.categoryModel.create({ ...payload });
        return this.mapDoc(created.toObject());
    }

    async updateCategory(id: string, payload: UpdateProductCategoryDto) {
        const _id = new Types.ObjectId(id);
        const updated = await this.categoryModel.findOneAndUpdate(
            { _id, isDeleted: false },
            { ...payload },
            { new: true }
        ).lean();
        return updated ? this.mapDoc(updated) : null;
    }

    async softDeleteCategory(id: string) {
        const _id = new Types.ObjectId(id);
        const updated = await this.categoryModel.findOneAndUpdate(
            { _id, isDeleted: false },
            { isDeleted: true, isActive: false },
            { new: true }
        ).lean();
        return updated ? this.mapDoc(updated) : null;
    }

    async getAllCategories() {
        const list = await this.categoryModel.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
        return list.map(d => this.mapDoc(d));
    }

    async getById(id: string) {
        const _id = new Types.ObjectId(id);
        const doc = await this.categoryModel.findOne({ _id, isDeleted: false }).lean();
        return doc ? this.mapDoc(doc) : null;
    }

    async getBySlug(slug: string) {
        const doc = await this.categoryModel.findOne({ slug, isDeleted: false }).lean();
        return doc ? this.mapDoc(doc) : null;
    }

    private mapDoc<T extends any>(doc: T & { _id?: any }): any {
        if (!doc) return doc;
        const { _id, ...rest } = doc as any;
        return { id: _id?.toString?.() ?? _id, ...rest };
    }
}


