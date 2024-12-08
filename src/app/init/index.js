
import chalk from "chalk";
import { initEvents } from "../../events/events.js";
import { initUsers } from "./initUsers.js";
import fs from 'fs';
import path from 'path';

export const InitBot = async () => {
    initEvents();
    const users = await initUsers();

    const newUsers = Array.from(users.entries()).reduce((acc, [userId, userData]) => {
        acc[userId] = { reputationScore: 0, role: null, joinedAt: userData.joinedTimestamp };
        return acc;
    }, {});

    const rootPath = process.cwd();
    const dbDir = path.join(rootPath, 'db');
    const usersFile = path.join(dbDir, 'users.json');

    function ensureFileExists() {

        if (!fs.existsSync(dbDir)) {
            console.info('No directory found, creating...');
            fs.mkdirSync(dbDir);
        }


        if (!fs.existsSync(usersFile)) {
            console.info('File not found, creating...');
            fs.writeFileSync(usersFile, JSON.stringify({}, null, 2));
        }
    }

    function mergeDataWithFile(newData) {
        let existingData = {};


        if (fs.existsSync(usersFile)) {
            const fileContent = fs.readFileSync(usersFile, 'utf8');
            existingData = JSON.parse(fileContent || '{}');
        }


        const mergedData = { ...existingData, ...newData };


        fs.writeFile(usersFile, JSON.stringify(mergedData, null, 2), (err) => {
            if (err) {
                console.error('Error writing updated file', err);
            } else {
                console.info(chalk.green('Sucessfully updated!'));
            }
        });
    }

    ensureFileExists();
    mergeDataWithFile(newUsers);
}