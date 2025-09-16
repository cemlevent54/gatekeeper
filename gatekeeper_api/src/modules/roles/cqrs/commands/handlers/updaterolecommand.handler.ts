import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRoleCommand } from '../impl/updaterolecommand.impl';
import { RolesService } from '../../../services/roles.service';
import { GetRoleDto } from '../../../dto/get-role.dto';

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleCommandHandler implements ICommandHandler<UpdateRoleCommand> {
    constructor(private readonly rolesService: RolesService) { }

    async execute(command: UpdateRoleCommand): Promise<GetRoleDto> {
        return this.rolesService.updateRole(command.roleId, command.updateData);
    }
}
