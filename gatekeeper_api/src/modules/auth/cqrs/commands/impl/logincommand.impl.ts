export class LoginCommand {
    constructor(
        public readonly usernameOrEmail: string,
        public readonly password: string,
    ) { }
}


