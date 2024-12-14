import { Collection, Role } from "discord.js"
import { adminFilePath, bodyaFilePath } from "../constants"

const ROLES = {
    BODYA: '795755942712311849',
    ADMIN: '517425798421151756',
}

export const getAudioFileByRole = (roles?: Collection<string, Role>): string | null => {
    if (!roles) return null;
    const ADMIN_CASE = Boolean(roles.find((r) => r.id === ROLES.ADMIN));
    const BODYA_CASE = false;
    //  Boolean(roles.find((r) => r.id === ROLES.BODYA));
    switch (true) {
        case ADMIN_CASE: {
            return adminFilePath
        }
        case BODYA_CASE: {
            return bodyaFilePath
        }
        default:
            return null
    }
}