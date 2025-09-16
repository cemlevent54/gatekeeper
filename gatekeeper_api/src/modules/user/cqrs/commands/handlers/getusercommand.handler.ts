import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetUserCommand } from '../impl/getusercommand.impl';
import { UserService } from '../../../services/user.service';
import { GetUserDto } from '../../../dto/get-user.dto';

@CommandHandler(GetUserCommand)
export class GetUserCommandHandler implements ICommandHandler<GetUserCommand> {
    constructor(private readonly userService: UserService) { }

    async execute(command: GetUserCommand): Promise<GetUserDto> {
        return this.userService.getUserById(command.userId, command.requestingUserId);
    }
}
