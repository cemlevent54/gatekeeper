import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from '../impl/registercommand.impl';
import { AuthService } from '../../../services/auth.service';

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand, any> {
    constructor(private readonly authService: AuthService) { }

    async execute(command: RegisterCommand): Promise<any> {
        const { username, email, password } = command;
        return this.authService.register({ username, email, password });
    }
}


