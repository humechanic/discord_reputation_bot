import { config } from 'dotenv';
import { initApp } from './app/index.js';

config();
initApp();

// removing reaction causes removing action
// scan recent messages to find if there reaction === up and reactions contains user id to ignore

