import { UpdateRolePermissionsDto } from '../../../dto/assign-permission-to-role.dto';

export class UpdateRolePermissionsCommand {
    constructor(
        public readonly roleId: string,
        public readonly updateRolePermissionsDto: UpdateRolePermissionsDto
    ) { }
}
