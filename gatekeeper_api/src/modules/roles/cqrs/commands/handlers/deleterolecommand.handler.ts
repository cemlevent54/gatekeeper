import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteRoleCommand } from '../impl/deleterolecommand.impl';
import { RolesService } from '../../../services/roles.service';

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleCommandHandler implements ICommandHandler<DeleteRoleCommand> {
    constructor(private readonly rolesService: RolesService) { }

    async execute(command: DeleteRoleCommand): Promise<{ message: string }> {
        return this.rolesService.deleteRole(command.roleId);
    }
}
