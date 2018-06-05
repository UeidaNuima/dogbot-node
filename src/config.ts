import { readFileSync } from 'fs-extra';
export default JSON.parse(readFileSync('./config.json', { encoding: 'utf-8' }));
