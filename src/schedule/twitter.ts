import * as request from 'request-promise-native';
import { Twitter } from '../model';
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

export default async function grabAigisTwitter(bot: any) {
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
            bot('send_group_msg', {
              group_id: group,
              message: await tweet.toArray(),
            });
            console.info(`Sent a new twitter to ${group} via Aigis1000`);
          }
        }
      } else {
        console.info(`Inited　a tweet.`);
      }
    }
  }

  // init it
  isInit = true;
}
