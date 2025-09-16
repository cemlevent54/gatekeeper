import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../impl/deleteusercommand.impl';
import { UserService } from '../../../services/user.service';

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler implements ICommandHandler<DeleteUserCommand> {
    constructor(private readonly userService: UserService) { }

    async execute(command: DeleteUserCommand): Promise<{ message: string }> {
        return this.userService.deleteUser(command.userId, command.requestingUserId);
    }
}
