import path from 'path';
import fs from 'fs';

export const getDBDir = () => {
    const rootPath = process.cwd();
    const dbDir = path.join(rootPath, 'db');
    if (!fs.existsSync(dbDir)) {
        console.info('No directory found, creating...');
        fs.mkdirSync(dbDir);
    }
    return dbDir
}

export const getDBFile = () => {
    const dbDir = getDBDir();

    const usersFile = path.join(dbDir, 'users.json');

    if (!fs.existsSync(usersFile)) {
        console.info('File not found, creating...');
        fs.writeFileSync(usersFile, JSON.stringify({}, null, 2));
    }

    return usersFile
}