import { readFileSync, existsSync } from 'fs-extra';
import { ProvidedRequiredArgumentsOnDirectives } from 'graphql/validation/rules/ProvidedRequiredArguments';

let config: { [k: string]: any };

if (existsSync('./config.json')) {
  const configFromFile = JSON.parse(
    readFileSync('./config.json', { encoding: 'utf-8' }),
  );
  config = configFromFile;
} else {
  config = {
    twitter: {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      token_secret: process.env.TWITTER_TOKEN_SECRET,
      token: process.env.TWITTER_TOKEN,
    },
    aigisGroups: process.env.AIGIS_GROUPS
      ? process.env.AIGIS_GROUPS!.split(':').map(s => Number.parseInt(s, 10))
      : [],
    CQRoot: process.env.CQROOT,
    mongodbURL: process.env.MONGODB_URL,
  };
}

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
  console.error('Missing env!');
  process.exit();
}

export default config;
