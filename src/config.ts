import { readFileSync, existsSync } from 'fs-extra';
import * as path from 'path';

const CONFIG_ROOT = process.env.CONFIG_ROOT || '.';

const configPath = path.join(CONFIG_ROOT, 'config.json');

if (!existsSync(configPath)) {
  console.error('No config file found!');
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, { encoding: 'utf-8' }));

if (
  !(
    config.twitter.consumer_key &&
    config.twitter.consumer_secret &&
    config.twitter.token_secret &&
    config.twitter.token &&
    config.CQRoot &&
    config.mongodbURL
  )
) {
  console.error('Missing config field(s)!');
  process.exit(1);
}

export default config;
