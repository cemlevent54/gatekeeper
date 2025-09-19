import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Controller method'larına permission gereksinimlerini belirtmek için kullanılır
 * 
 * @param permissions - Gerekli permission'lar (string array)
 * 
 * @example
 * @Permissions('user.view')
 * @Permissions(['user.view', 'user.edit'])
 * @Permissions('user.*') // Wildcard permission
 */
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
