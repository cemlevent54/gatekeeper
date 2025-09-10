import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { promises as fs } from 'fs';
import * as handlebars from 'handlebars';

type MailRecipient = string | string[];

export interface SendMailOptions {
    cc?: MailRecipient;
    bcc?: MailRecipient;
    attachments?: Array<{ filename: string; path?: string; content?: any; contentType?: string }>;
    headers?: Record<string, string>;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger('EmailService');

    constructor(private readonly configService: ConfigService) { }

    private createTransport() {
        const host = this.configService.get<string>('MAIL_HOST');
        const port = Number(this.configService.get<string>('MAIL_PORT')) || 587;
        const user = this.configService.get<string>('MAIL_USER');
        const pass = this.configService.get<string>('MAIL_PASS');

        if (!host || !user || !pass) {
            throw new Error('SMTP ayarları eksik (MAIL_HOST, MAIL_USER, MAIL_PASS)');
        }

        const secureEnv = this.configService.get<string>('MAIL_SECURE');
        const secure = typeof secureEnv !== 'undefined' ? secureEnv === 'true' : port === 465; // 465 -> SSL/TLS, 587 -> STARTTLS

        return nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
            tls: secure ? undefined : { ciphers: 'SSLv3' },
        });
    }

    private async renderTemplate(template: string, templateFillAreas: Record<string, any> = {}): Promise<string> {
        const templatesDir = path.resolve(process.cwd(), 'src', 'modules', 'mail', 'templates');
        const filePath = path.join(templatesDir, `${template}.hbs`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const compiled = handlebars.compile(fileContent);
        return compiled(templateFillAreas || {});
    }

    public async sendMail(
        to: MailRecipient,
        template: string,
        templateFillAreas: Record<string, any> = {},
        subject: string | null = null,
        options: SendMailOptions = {},
    ): Promise<boolean> {
        try {
            const transporter = this.createTransport();
            const html = await this.renderTemplate(template, templateFillAreas);

            const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS');
            const fromName = this.configService.get<string>('MAIL_FROM_NAME');
            const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

            const mailSubject = subject || templateFillAreas?.subject || 'Notification';

            // Bağlantıyı doğrula (erken hata yakalama)
            await transporter.verify();

            const info = await transporter.sendMail({
                from,
                to,
                subject: mailSubject,
                html,
                cc: options.cc,
                bcc: options.bcc,
                attachments: options.attachments,
                headers: options.headers,
            });

            this.logger.log(`Mail sent: ${info.messageId}`);
            return true;
        } catch (err: any) {
            this.logger.error(`Mail gönderimi başarısız: ${err?.message || err}`);
            return false;
        }
    }
}


