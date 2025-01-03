import { initEvents } from "../../events/events.js"; import { initUserDb } from "./initUserDb.js";

export const InitBot = async () => {
    await initEvents();
    await initUserDb();
}