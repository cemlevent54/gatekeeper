import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../impl/updateusercommand.impl';
import { UserService } from '../../../services/user.service';
import { GetUserDto } from '../../../dto/get-user.dto';

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand> {
    constructor(private readonly userService: UserService) { }

    async execute(command: UpdateUserCommand): Promise<GetUserDto> {
        return this.userService.updateUser(command.userId, command.updateData, command.requestingUserId);
    }
}
