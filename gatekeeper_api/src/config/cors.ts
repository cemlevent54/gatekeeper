import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const getCorsConfig = (): CorsOptions => {
    return {
        origin: [
            'http://localhost:4200',  // Angular development server
            'http://localhost:3000',  // Backend development server
            'http://127.0.0.1:4200',  // Alternative localhost
            'http://127.0.0.1:3000',  // Alternative localhost
            // Production URL'lerini buraya ekleyebilirsin
            // 'https://yourdomain.com',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'Cache-Control',
            'Pragma',
        ],
        credentials: true, // Cookie'ler ve authorization header'ları için
        preflightContinue: false,
        optionsSuccessStatus: 204,
    };
};
