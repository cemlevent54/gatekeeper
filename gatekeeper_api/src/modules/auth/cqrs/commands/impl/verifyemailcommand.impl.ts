export class VerifyEmailCommand {
    constructor(
        public readonly otpCode: string,
        public readonly token: string,
    ) {}
}
