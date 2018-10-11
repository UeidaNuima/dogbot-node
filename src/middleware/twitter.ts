import { Context, RecvGroupMessage } from 'dogq';
import { split } from '../util';
import { Twitter } from '../model';
import config from '../config';

/**
 * Return a biased Date by given days
 * @param days days to be biased
 */
function deltaDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export default async function twitter(ctx: Context) {
  let daysBefore = 0;
  if (ctx.match) {
    const [param] = split(ctx.match[1]);
    daysBefore = param ? Number.parseInt(param) : 0;
  }

  if (Number.isNaN(daysBefore) || daysBefore < 0) {
    ctx.reply('兄啊格式不对');
    return;
  }
  let screenName: string;
  const message = ctx.message as RecvGroupMessage;
  if (config.aigisGroups.includes(message.group)) {
    screenName = 'Aigis1000';
  } else if (config.gfGroups.includes(message.group)) {
    screenName = 'GirlsFrontline';
  } else {
    return;
  }
  const twitters = await Twitter.find({
    time: { $gte: deltaDays(-daysBefore - 1), $lt: deltaDays(-daysBefore) },
    'user.screenName': screenName,
  });
  twitters.sort((a, b) => {
    const sa = a.time.getTime();
    const sb = b.time.getTime();
    if (sa > sb) {
      return 1;
    }
    if (sa === sb) {
      return 0;
    }
    return -1;
  });
  if (twitters.length !== 0) {
    ctx.reply((await Promise.all(twitters.map(t => t.toString()))).join('\n'));
  } else {
    ctx.reply('安娜啥都没说');
  }
}
