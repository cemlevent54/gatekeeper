import { IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class UpdateProductCategoryDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug sadece kucuk harf, rakam ve tire icerebilir' })
    slug?: string;

    @IsOptional()
    @IsString()
    description?: string;
}


