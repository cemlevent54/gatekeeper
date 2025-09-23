import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductDocument } from '../../../schemas/product.schema';

@Injectable()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository
    ) { }

    async createProduct(createProductDto: CreateProductDto, photoUrl?: string): Promise<ProductDocument> {
        try {
            // Aynı isimde ürün var mı kontrol et
            const existingProductByName = await this.productRepository.findByName(createProductDto.name);
            if (existingProductByName) {
                throw new ConflictException('Bu isimde bir ürün zaten mevcut');
            }

            // Aynı slug'da ürün var mı kontrol et
            const existingProductBySlug = await this.productRepository.findBySlug(createProductDto.slug);
            if (existingProductBySlug) {
                throw new ConflictException('Bu slug ile bir ürün zaten mevcut');
            }

            const productData = {
                ...createProductDto,
                photo_url: photoUrl || createProductDto.photo_url
            };

            return await this.productRepository.create(productData);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Ürün oluşturulurken hata oluştu: ' + error.message);
        }
    }

    async findAllProducts(): Promise<ProductDocument[]> {
        return await this.productRepository.findAll();
    }

    async findProductById(id: string): Promise<ProductDocument> {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundException('Ürün bulunamadı');
        }
        return product;
    }

    async updateProduct(id: string, updateProductDto: UpdateProductDto, photoUrl?: string): Promise<ProductDocument> {
        try {
            const existingProduct = await this.productRepository.findById(id);
            if (!existingProduct) {
                throw new NotFoundException('Ürün bulunamadı');
            }

            // İsim değiştiriliyorsa, yeni isim başka ürün tarafından kullanılıyor mu kontrol et
            if (updateProductDto.name && updateProductDto.name !== existingProduct.name) {
                const productWithSameName = await this.productRepository.findByName(updateProductDto.name);
                if (productWithSameName) {
                    throw new ConflictException('Bu isimde bir ürün zaten mevcut');
                }
            }

            // Slug değiştiriliyorsa, yeni slug başka ürün tarafından kullanılıyor mu kontrol et
            if (updateProductDto.slug && updateProductDto.slug !== existingProduct.slug) {
                const productWithSameSlug = await this.productRepository.findBySlug(updateProductDto.slug);
                if (productWithSameSlug) {
                    throw new ConflictException('Bu slug ile bir ürün zaten mevcut');
                }
            }

            const updateData = {
                ...updateProductDto,
                photo_url: photoUrl || updateProductDto.photo_url
            };

            const updatedProduct = await this.productRepository.update(id, updateData);
            if (!updatedProduct) {
                throw new NotFoundException('Ürün güncellenemedi');
            }
            return updatedProduct;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Ürün güncellenirken hata oluştu: ' + error.message);
        }
    }

    async deleteProduct(id: string): Promise<ProductDocument> {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundException('Ürün bulunamadı');
        }

        if (product.isDeleted) {
            throw new BadRequestException('Ürün zaten silinmiş');
        }

        const deletedProduct = await this.productRepository.softDelete(id);
        if (!deletedProduct) {
            throw new NotFoundException('Ürün silinemedi');
        }
        return deletedProduct;
    }

    async findProductsByCategory(categoryId: string): Promise<ProductDocument[]> {
        return await this.productRepository.findByCategory(categoryId);
    }
}
