import * as request from 'request-promise-native';
import { Twitter } from '../model';
import Bot from 'dogq';
import config from '../config';

const oauth = config.twitter;

async function grabTimeLine(name: string): Promise<any[]> {
  return JSON.parse(
    await request.get({
      url: 'https://api.twitter.com/1.1/statuses/user_timeline.json',
      oauth,
      qs: {
        screen_name: name,
        tweet_mode: 'extended',
        count: 10,
      },
      proxy: process.env.proxy ? process.env.proxy : undefined,
    }),
  );
}

// init twitter only once
let isInit = false;

export default async function grabAigisTwitter(bot: Bot) {
  const resp = await grabTimeLine('aigis1000');
  for (const twitter of resp) {
    const exist = await Twitter.findOne({ id: twitter.id });
    if (!exist) {
      const tweet = new Twitter();
      await tweet.create(twitter).save();
      // send to groups if inited
      if (isInit) {
        for (const group of config.aigisGroups) {
          bot.send({
            type: 'SentGroupMessage',
            group,
            text: await tweet.toString(),
          });
          bot.logger.info(`Sent a new twitter to ${group} via aigis1000`);
        }
      } else {
        bot.logger.info(`Inited　a tweet.`);
      }
    }
  }

  // init it
  isInit = true;
}
