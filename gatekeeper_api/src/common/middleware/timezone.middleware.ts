import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimezoneMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Timezone'u environment'dan al
        const timezone = process.env.TZ || 'Europe/Istanbul';

        // Request'e timezone bilgisini ekle
        (req as any).timezone = timezone;

        // Response header'ına timezone bilgisini ekle
        res.setHeader('X-Timezone', timezone);

        next();
    }
}
