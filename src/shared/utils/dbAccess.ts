import fs from 'fs';
import { getDBFile } from "./paths.js"

export const getUsersDB = () => {
    const usersFile = getDBFile();
    const data = fs.readFileSync(usersFile, 'utf8')
    return JSON.parse(data);
}