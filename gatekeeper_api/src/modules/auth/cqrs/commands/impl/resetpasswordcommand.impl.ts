export class ResetPasswordCommand {
    constructor(
        public readonly otpCode: string,
        public readonly token: string,
        public readonly password: string,
    ) { }
}
