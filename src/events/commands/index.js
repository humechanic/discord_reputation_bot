import { pingCommand } from "./ping.js";
import { scanCommand } from "./scan.js";

export const commands = () => {
    pingCommand();
    scanCommand();
}