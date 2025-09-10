import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    private isPlainObject(obj: any): boolean {
        if (obj === null || typeof obj !== 'object') return false;
        const proto = Object.getPrototypeOf(obj);
        return proto === Object.prototype || proto === null;
    }

    private maskSensitive(data: any, seen = new WeakSet<any>(), depth = 0): any {
        if (data === null || typeof data !== 'object') return data;
        if (seen.has(data)) return '[Circular]';
        if (depth > 3) return '[Truncated]';

        // Primitives or special objects left as-is
        const ctorName = (data as any)?.constructor?.name;
        if (ctorName && ctorName !== 'Object' && ctorName !== 'Array') {
            // Avoid deep walking non-plain objects (Buffer, Date, ObjectId, etc.)
            return String(data);
        }

        seen.add(data);
        const keysToMask = ['password', 'pass', 'pwd', 'authorization'];
        if (Array.isArray(data)) {
            return data.map((item) => this.maskSensitive(item, seen, depth + 1));
        }

        const result: any = {};
        for (const key of Object.keys(data)) {
            if (keysToMask.includes(key.toLowerCase())) {
                result[key] = '***';
            } else {
                result[key] = this.maskSensitive((data as any)[key], seen, depth + 1);
            }
        }
        return result;
    }

    private safeStringify(value: any, maxLen = 1000): string {
        try {
            if (typeof value === 'string') {
                return value.length > maxLen ? value.slice(0, maxLen) + '…' : value;
            }
            const getCircularReplacer = () => {
                const seen = new WeakSet();
                return (_key: string, val: any) => {
                    if (typeof val === 'object' && val !== null) {
                        if (seen.has(val)) return '[Circular]';
                        seen.add(val);
                    }
                    return val;
                };
            };
            const str = JSON.stringify(value, getCircularReplacer());
            return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
        } catch {
            return String(value);
        }
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const http = context.switchToHttp();
        const req = http.getRequest<Request & { method?: string; url?: string; body?: any; ip?: string; headers?: any }>();
        const res = http.getResponse<any>();

        const method = (req?.method || '').toUpperCase();
        const url = req?.url || '';
        const ip = (req?.headers && (req.headers['x-forwarded-for'] as string)) || (req as any)?.ip || '';

        const maskedBody = this.maskSensitive((req as any)?.body);
        const requestInfo = this.safeStringify({ body: maskedBody });
        this.logger.debug(`→ ${method} ${url} from ${ip} | req ${requestInfo}`);

        // Patch only res.send to capture body when controller uses @Res()
        const self = this;
        const originalSend = typeof res?.send === 'function' ? res.send.bind(res) : undefined;
        if (originalSend) {
            res.send = function (body: any) {
                const ms = Date.now() - now;
                const status = res?.statusCode ?? 200;
                let info: string;
                try {
                    let logBody: any = body;
                    if (typeof body === 'string') {
                        try { logBody = JSON.parse(body); } catch { /* keep as string */ }
                    }
                    const masked = self.maskSensitive(logBody);
                    info = self.safeStringify(masked);
                } catch {
                    info = typeof body === 'string' ? body : String(body);
                }
                self.logger.log(`${method} ${url} ${status} - ${ms}ms | res ${info}`);
                // işaretle: yanıt gövdesi loglandı
                (res as any).__bodyLogged = true;
                return originalSend(body);
            };
        }

        return next.handle().pipe(
            tap((data) => {
                // Eğer @Res() kullanıldıysa ve send ile loglandıysa, burada tekrar loglama
                if ((res as any).__bodyLogged) {
                    return;
                }
                const ms = Date.now() - now;
                const status = (res as any)?.statusCode ?? 200;
                let responseInfo: string;
                if (data === undefined) {
                    responseInfo = '[no body]';
                } else if (Array.isArray(data) || this.isPlainObject(data)) {
                    const maskedResponse = this.maskSensitive(data);
                    responseInfo = this.safeStringify(maskedResponse);
                } else {
                    const typeName = (data as any)?.constructor?.name || typeof data;
                    responseInfo = `[${typeName}]`;
                }
                this.logger.log(`${method} ${url} ${status} - ${ms}ms | res ${responseInfo}`);
            }),
            catchError((err) => {
                const ms = Date.now() - now;
                const status = (res as any)?.statusCode ?? err?.status ?? 500;
                this.logger.error(`${method} ${url} ${status} - ${ms}ms | error ${err?.message}`, err?.stack);
                throw err;
            }),
        );
    }
}


