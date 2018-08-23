import * as schedule from 'node-schedule';
import grabAigisTwitter from './twitter';
import maintenanceAnnounce from './maintenanceAnnounce';
import Bot from 'dogq';
import config from '../config';

export function createScheduleJobs(bot: Bot) {
  schedule.scheduleJob('*/30 * * * * *', grabAigisTwitter.bind(null, bot));
  schedule.scheduleJob(
    '0 0 8 * * 4',
    maintenanceAnnounce.bind(null, bot, config.aigisGroups, '千年战争aigis'),
  );
  schedule.scheduleJob(
    '0 0 9 * * 4',
    maintenanceAnnounce.bind(null, bot, config.gfGroups, '少女前线'),
  );
}
