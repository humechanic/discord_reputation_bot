import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const getDirname = (meta) => dirname(fileURLToPath(meta.url));
export const getFilename = (meta) => fileURLToPath(meta.url);