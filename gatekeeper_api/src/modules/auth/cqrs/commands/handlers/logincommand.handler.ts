import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../impl/logincommand.impl';
import { AuthService } from '../../../services/auth.service';

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand, any> {
    constructor(private readonly authService: AuthService) { }

    async execute(command: LoginCommand): Promise<any> {
        const { usernameOrEmail, password } = command;
        return this.authService.login({ usernameOrEmail, password });
    }
}


