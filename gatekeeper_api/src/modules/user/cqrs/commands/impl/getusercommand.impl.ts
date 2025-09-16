export class GetUserCommand {
    constructor(
        public readonly userId: string,
        public readonly requestingUserId: string,
    ) { }
}
