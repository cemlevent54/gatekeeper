import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetAllUsersCommand } from '../impl/getalluserscommand.impl';
import { UserService } from '../../../services/user.service';
import { GetUserDto } from '../../../dto/get-user.dto';

@CommandHandler(GetAllUsersCommand)
export class GetAllUsersCommandHandler implements ICommandHandler<GetAllUsersCommand> {
    constructor(private readonly userService: UserService) { }

    async execute(command: GetAllUsersCommand): Promise<GetUserDto[]> {
        return this.userService.getAllUsers(command.requestingUserId);
    }
}
