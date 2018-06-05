import * as schedule from 'node-schedule';
import grabAigisTwitter from './twitter';
import Bot from 'dogq';

export function createScheduleJobs(bot: Bot) {
  schedule.scheduleJob('*/30 * * * * *', grabAigisTwitter.bind(null, bot));
}
