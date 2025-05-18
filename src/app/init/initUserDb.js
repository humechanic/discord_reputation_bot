import chalk from "chalk";
import fs from "fs";

import { getDBFile } from "@shared/utils/paths.js";
import { initUsers } from "./initUsers.js";
import { getUsersDB } from "@shared/utils/dbAccess.js";

function mergeDataWithFile(initUserDBData, usersFile) {

    let existingData = {}

    if (fs.existsSync(usersFile)) {
        const fileContent = fs.readFileSync(usersFile, 'utf8');
        existingData = JSON.parse(fileContent || '{}');
    }

    const mergedData = { ...initUserDBData, ...existingData };

    fs.writeFile(usersFile, JSON.stringify(mergedData, null, 2), (err) => {
        if (err) {
            console.error('Error writing updated file', err);
        } else {
            console.info(chalk.green('Sucessfully updated!'));
        }
    });
}

export const initUserDb = async () => {
    const users = await initUsers();

    const initUserDBData = Array.from(users.entries()).reduce((acc, [userId, userData]) => {

        acc[userId] = { reputationScore: 0, role: '1203666181215748096', joinedAt: userData.joinedTimestamp, isBot: userData.user.bot };
        return acc;
    }, {});

    const usersDBData = getUsersDB();
    const usersDBFile = getDBFile();

    // if (!Object.keys(usersDBData).length) {

    mergeDataWithFile(initUserDBData, usersDBFile);
    // }
}
// '1203665477260419112'- 'завсегдатай'
// '1203665541168898049'- 'душа сообщества'
// '1203666181215748096'- 'случайный'
// "x" - moder