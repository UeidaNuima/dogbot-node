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
        count: 15,
      },
      proxy: process.env.proxy ? process.env.proxy : undefined,
    }),
  );
}

// init twitter only once
let isInit = false;

export default async function grabAigisTwitter(bot: Bot) {
  const resps = await Promise.all([
    grabTimeLine('Aigis1000'),
    // grabTimeLine('GirlsFrontline'),
  ]);
  const resp = [...resps[0].reverse()];
  for (const twitter of resp) {
    const exist = await Twitter.findOne({ id: twitter.id });
    if (!exist) {
      const tweet = new Twitter();
      await tweet.create(twitter).save();
      // send to groups if inited
      if (isInit) {
        if (tweet.user.screenName === 'Aigis1000') {
          for (const group of config.aigisGroups) {
            bot.send({
              type: 'SentGroupMessage',
              group,
              text: await tweet.toString(),
            });
            bot.logger.info(`Sent a new twitter to ${group} via Aigis1000`);
          }
        } else if (tweet.user.screenName === 'GirlsFrontline') {
          for (const group of config.gfGroups) {
            bot.send({
              type: 'SentGroupMessage',
              group,
              text: await tweet.toString(),
            });
            bot.logger.info(
              `Sent a new twitter to ${group} via GirlsFrontline`,
            );
          }
        }
      } else {
        bot.logger.info(`Inited　a tweet.`);
      }
    }
  }

  // init it
  isInit = true;
}
