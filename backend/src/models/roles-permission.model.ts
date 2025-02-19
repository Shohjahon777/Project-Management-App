import mongoose, {Document, Schema} from 'mongoose';

import {
    Permissions,
    PermissionsType,
    Roles,
    RolesType,
} from "../enums/role.enum"

import {RolePermissions} from "../utils/role-permission";

export interface RoleDocument extends Document {
    name: RolesType;
    permissions: Array<PermissionsType>;
}

const roleSchema = new Schema<RoleDocument>({
    name: {
        type: String,
        required: true,
        enum: Object.values(Roles),
        unique: true,
    },
    permissions: {
        type: [String],
        required: true,
        enum: Object.values(Permissions),
        default: function (this  : RoleDocument) {
            return RolePermissions[this.name];
        },
    },
}, {
    timestamps: true,
})

const RoleModel = mongoose.model<RoleDocument>("Role", roleSchema);
export default RoleModel;