import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ValidationPipe,
    HttpStatus,
    Res,
    ParseFilePipe,
    MaxFileSizeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('product')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Public()
    @Get()
    async getAllProducts(@Res() res: any) {
        try {
            const products = await this.productService.findAllProducts();

            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Ürünler başarıyla getirildi',
                data: products
            } as ApiResponse<any>);
        } catch (error: any) {
            const status = error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                success: false,
                message: error?.message || 'Ürünler getirilemedi',
                data: null
            } as ApiResponse<any>);
        }
    }

    @Permissions('product.view', 'product.*')
    @Get(':id')
    async getProductById(@Param('id') id: string, @Res() res: any) {
        try {
            const product = await this.productService.findProductById(id);

            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Ürün başarıyla getirildi',
                data: product
            } as ApiResponse<any>);
        } catch (error: any) {
            const status = error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            return res.status(status).json({
                success: false,
                message: error?.message || 'Ürün getirilemedi',
                data: null
            } as ApiResponse<any>);
        }
    }

    @Permissions('product.create', 'product.*')
    @Post()
    @UseInterceptors(FileInterceptor('photo', {
        storage: diskStorage({
            destination: './uploads/products',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Sadece resim dosyaları kabul edilir!'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        }
    }))
    async createProduct(
        @Body(new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true }
        })) createProductDto: CreateProductDto,
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }) // 5MB
            ],
            fileIsRequired: false
        })) file: any,
        @Res() res: any
    ) {
        try {
            let photoUrl: string | undefined;

            if (file) {
                photoUrl = `/uploads/products/${file.filename}`;
            }

            const product = await this.productService.createProduct(createProductDto, photoUrl);

            return res.status(HttpStatus.CREATED).json({
                success: true,
                message: 'Ürün başarıyla oluşturuldu',
                data: product
            } as ApiResponse<any>);
        } catch (error: any) {
            const status = error?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: error?.message || 'Ürün oluşturulamadı',
                data: null
            } as ApiResponse<any>);
        }
    }

    @Permissions('product.edit', 'product.*')
    @Patch(':id')
    @UseInterceptors(FileInterceptor('photo', {
        storage: diskStorage({
            destination: './uploads/products',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Sadece resim dosyaları kabul edilir!'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        }
    }))
    async updateProduct(
        @Param('id') id: string,
        @Body(new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true }
        })) updateProductDto: UpdateProductDto,
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }) // 5MB
            ],
            fileIsRequired: false
        })) file: any,
        @Res() res: any
    ) {
        try {
            let photoUrl: string | undefined;

            if (file) {
                photoUrl = `/uploads/products/${file.filename}`;
            }

            const product = await this.productService.updateProduct(id, updateProductDto, photoUrl);

            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Ürün başarıyla güncellendi',
                data: product
            } as ApiResponse<any>);
        } catch (error: any) {
            const status = error?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: error?.message || 'Ürün güncellenemedi',
                data: null
            } as ApiResponse<any>);
        }
    }

    @Permissions('product.delete', 'product.*')
    @Delete(':id')
    async deleteProduct(@Param('id') id: string, @Res() res: any) {
        try {
            const product = await this.productService.deleteProduct(id);

            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Ürün başarıyla silindi',
                data: product
            } as ApiResponse<any>);
        } catch (error: any) {
            const status = error?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: error?.message || 'Ürün silinemedi',
                data: null
            } as ApiResponse<any>);
        }
    }
}
