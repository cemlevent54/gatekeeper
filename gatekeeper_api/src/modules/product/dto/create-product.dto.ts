import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return parseFloat(value);
        }
        return value;
    })
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsOptional()
    @IsString()
    photo_url?: string;

    @IsMongoId()
    @IsNotEmpty()
    category: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
