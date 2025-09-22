import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductCategoryRepository } from '../repositories/product-category.repository';
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dto/update-product-category.dto';

@Injectable()
export class ProductCategoryService {
    constructor(private readonly repo: ProductCategoryRepository) { }

    async create(dto: CreateProductCategoryDto) {
        // basit benzersizlik kontrolü
        const exists = await this.repo.getBySlug(dto.slug);
        if (exists) {
            throw new BadRequestException('Slug zaten kullanılıyor');
        }
        return this.repo.createCategory(dto);
    }

    async update(id: string, dto: UpdateProductCategoryDto) {
        if (dto.slug) {
            const exists = await this.repo.getBySlug(dto.slug);
            if (exists && String(exists._id) !== String(id)) {
                throw new BadRequestException('Slug zaten kullanılıyor');
            }
        }
        const updated = await this.repo.updateCategory(id, dto);
        if (!updated) throw new NotFoundException('Kategori bulunamadı');
        return updated;
    }

    async remove(id: string) {
        const deleted = await this.repo.softDeleteCategory(id);
        if (!deleted) throw new NotFoundException('Kategori bulunamadı');
        return { id, message: 'Kategori soft delete ile işaretlendi' };
    }

    async findAll() {
        return this.repo.getAllCategories();
    }

    async findOne(idOrSlug: string) {
        const byId = /^[a-f\d]{24}$/i.test(idOrSlug) ? await this.repo.getById(idOrSlug) : null;
        const found = byId || (await this.repo.getBySlug(idOrSlug));
        if (!found) throw new NotFoundException('Kategori bulunamadı');
        return found;
    }
}


