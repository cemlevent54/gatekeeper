import { UpdatePermissionDto } from '../../../dto/update-permission.dto';

export class UpdatePermissionCommand {
    constructor(
        public readonly permissionId: string,
        public readonly updatePermissionDto: UpdatePermissionDto
    ) { }
}
