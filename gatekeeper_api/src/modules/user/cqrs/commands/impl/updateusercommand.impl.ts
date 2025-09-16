import { UpdateUserDto } from '../../../dto/update-user.dto';

export class UpdateUserCommand {
    constructor(
        public readonly userId: string,
        public readonly updateData: UpdateUserDto,
        public readonly requestingUserId: string,
    ) { }
}
