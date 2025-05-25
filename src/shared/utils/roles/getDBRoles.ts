import fs from "fs";
import path from "path";

export const getDBRoles = async () => {
    const ROLES_PATH = path.join(process.cwd(), 'db', 'roles.json');
    const roles = JSON.parse(fs.readFileSync(ROLES_PATH, 'utf8'));
    return roles;
}