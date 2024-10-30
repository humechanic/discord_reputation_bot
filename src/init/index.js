
import { initEvents } from "../events/events.js";
import { initUsers } from "./initUsers.js";

export const InitBot = async () => {
    initEvents();
    await initUsers();

}