import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetAllRolesCommand } from '../impl/getallrolescommand.impl';
import { RolesService } from '../../../services/roles.service';
import { GetRoleDto } from '../../../dto/get-role.dto';

@CommandHandler(GetAllRolesCommand)
export class GetAllRolesCommandHandler implements ICommandHandler<GetAllRolesCommand> {
    constructor(private readonly rolesService: RolesService) { }

    async execute(command: GetAllRolesCommand): Promise<GetRoleDto[]> {
        return this.rolesService.getAllRoles();
    }
}
