import { UpdateRoleDto } from '../../../dto/update-role.dto';

export class UpdateRoleCommand {
    constructor(
        public readonly roleId: string,
        public readonly updateData: UpdateRoleDto,
    ) { }
}
