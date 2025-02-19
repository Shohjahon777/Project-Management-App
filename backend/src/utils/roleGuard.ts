import {RolePermissions} from "./role-permission";
import {PermissionsType} from "../enums/role.enum";
import {UnauthorizedException} from "./appError";

export const roleGuard = (
    role: keyof typeof RolePermissions,
    requiredPermissions: PermissionsType[]
) => {
    const  permissions = RolePermissions[role];
//     if the role doesn't exist or lacks required permissions, throw an exception

    const hasPermission = requiredPermissions.every(permission =>
        permissions.includes(permission)
    );

    if (!hasPermission) {
        throw new UnauthorizedException(
            "You don't have the required permissions to perform this action"
        )
    }
};