import { CreatePermissionDto } from '../../../dto/create-permission.dto';

export class CreatePermissionCommand {
    constructor(public readonly createPermissionDto: CreatePermissionDto) { }
}
