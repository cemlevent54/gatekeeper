import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ProductCategoryService } from '../services/product-category.service';
import { CreateProductCategoryDto } from '../dto/create-product-category.dto';
import { UpdateProductCategoryDto } from '../dto/update-product-category.dto';

@Controller('product-category')
export class ProductCategoryController {
    constructor(private readonly service: ProductCategoryService) { }

    @Permissions('product-category.view', 'product-category.*')
    @Get()
    async getAll(@Res() res: Response) {
        try {
            const data = await this.service.findAll();
            return res.status(HttpStatus.OK).json({ success: true, message: 'Kategoriler getirildi', data });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({ success: false, message: err?.message || 'Kategoriler getirilemedi', data: null });
        }
    }

    @Permissions('product-category.view', 'product-category.*')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Get(':idOrSlug')
    async getOne(@Param('idOrSlug') idOrSlug: string, @Res() res: Response) {
        try {
            const data = await this.service.findOne(idOrSlug);
            return res.status(HttpStatus.OK).json({ success: true, message: 'Kategori getirildi', data });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({ success: false, message: err?.message || 'Kategori getirilemedi', data: null });
        }
    }

    @Permissions('product-category.create', 'product-category.*')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Post()
    async create(@Body(new ValidationPipe()) body: CreateProductCategoryDto, @Res() res: Response) {
        try {
            const created = await this.service.create(body);
            return res.status(HttpStatus.CREATED).json({ success: true, message: 'Kategori oluşturuldu', data: created });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({ success: false, message: err?.message || 'Kategori oluşturulamadı', data: null });
        }
    }

    @Permissions('product-category.update', 'product-category.*')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Patch(':id')
    async update(@Param('id') id: string, @Body(new ValidationPipe()) body: UpdateProductCategoryDto, @Res() res: Response) {
        try {
            const updated = await this.service.update(id, body);
            return res.status(HttpStatus.OK).json({ success: true, message: 'Kategori güncellendi', data: updated });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({ success: false, message: err?.message || 'Kategori güncellenemedi', data: null });
        }
    }

    @Permissions('product-category.delete', 'product-category.*')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        try {
            const result = await this.service.remove(id);
            return res.status(HttpStatus.OK).json({ success: true, message: 'Kategori silindi', data: result });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({ success: false, message: err?.message || 'Kategori silinemedi', data: null });
        }
    }
}


