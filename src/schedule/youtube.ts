import * as request from 'request-promise-native';
import { Youtube } from '../model';
import config from '../config';

interface IYOUTUBE {
  key: string;
  notifications: Array<{
    channelId: string;
    groups: string[];
    qqs: string[];
  }>;
}

const YOUTUBE: IYOUTUBE = config.youtube;

// const YOUTUBE: IYOUTUBE = {
//   key: 'AIzaSyDS00rvgrh7kcYzsT_wJKOgORMRWu4P04o',
//   notifications: [
//     {
//       channelId: 'UC1suqwovbL1kzsoaZgFZLKg',
//       groups: [],
//       qqs: ['123105554'],
//     },
//     {
//       channelId: 'UC22BVlBsZc6ta3Dqz75NU6Q',
//       groups: [],
//       qqs: ['123105554'],
//     },
//   ],
// };

async function grabYoutubeSearchResoult(
  channelId: string,
  eventType: 'upcoming' | 'live',
) {
  return request.get({
    url: `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=${eventType}&maxResults=10&type=video&key=${
      YOUTUBE.key
    }`,
    proxy: process.env.proxy ? process.env.proxy : undefined,
    json: true,
  });
}

let isInited = false;

export default async function grabChannels(bot: any) {
  for (const notification of YOUTUBE.notifications) {
    let jobs: any[] = [];
    jobs.push(grabYoutubeSearchResoult(notification.channelId, 'live'));
    jobs.push(grabYoutubeSearchResoult(notification.channelId, 'upcoming'));
    jobs = await Promise.all(jobs);
    for (const job of jobs) {
      for (const videoItem of job.items) {
        const newYoutubeVideo = new Youtube().create(videoItem);
        const exist = await Youtube.findOne({ id: newYoutubeVideo.id });
        if (exist) {
          if (exist.equals(newYoutubeVideo)) {
            bot.logger.debug(
              `Youtube video [${newYoutubeVideo.id}][${
                newYoutubeVideo.title
              }] exists.`,
            );
            continue;
          } else {
            bot.logger.debug(
              `Youtube video [${newYoutubeVideo.id}][${
                newYoutubeVideo.title
              }] removed due to status change.`,
            );
            await exist.remove();
          }
        }
        newYoutubeVideo.save();

        if (isInited) {
          for (const group of notification.groups) {
            bot.send({
              type: 'SentGroupMessage',
              group,
              text: `${newYoutubeVideo.channelTitle} is on ${
                newYoutubeVideo.status
              }! ${newYoutubeVideo.getUrl()}`,
            });
          }
          for (const qq of notification.qqs) {
            bot.send({
              type: 'SentPrivateMessage',
              QQ: qq,
              text: `${newYoutubeVideo.channelTitle} is on ${
                newYoutubeVideo.status
              }! ${newYoutubeVideo.getUrl()}`,
            });
          }
        } else {
          bot.logger.info(`Inited a video ${newYoutubeVideo.id}`);
        }
      }
    }
  }
  isInited = true;
}
