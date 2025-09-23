import { CreateProductDto } from './create-product.dto';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return parseFloat(value);
        }
        return value;
    })
    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsString()
    photo_url?: string;

    @IsOptional()
    @IsMongoId()
    category?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
