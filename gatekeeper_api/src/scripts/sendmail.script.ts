import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../modules/mail/email.service';

function parseArgs(argv: string[]) {
    const obj: Record<string, string> = {};
    for (const a of argv) {
        const [k, ...rest] = a.split('=');
        const key = k.replace(/^--/, '');
        obj[key] = rest.join('=');
    }
    return obj;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));

    const to = args.to || process.env.MAIL_TEST_TO;
    const template = args.template || 'welcome';
    const subject = args.subject || 'Test Mail';
    const name = args.name || 'Test Kullanıcı';
    const actionUrl = args.actionUrl;

    if (!to) {
        console.error('Hata: --to=email@adres.com parametresi gerekli (ya da MAIL_TEST_TO env)');
        process.exit(1);
    }

    const emailService = new EmailService(new ConfigService());
    const ok = await emailService.sendMail(
        to,
        template,
        { name, subject, actionUrl },
        subject,
    );

    console.log(ok ? '✅ Mail gönderildi' : '❌ Mail gönderilemedi');
}

main().catch((err) => {
    console.error('❌ Hata:', err?.message || err);
    process.exit(1);
});


