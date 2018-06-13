import { Context } from 'dogq';
import { split } from '../util';
import { Twitter } from '../model';

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
  const [param] = split(ctx.match[1]);
  const daysBefore = param ? Number.parseInt(param) : 0;
  if (Number.isNaN(daysBefore) || daysBefore < 0) {
    ctx.reply('兄啊格式不对');
    return;
  }
  const twitters = await Twitter.find({
    time: { $gte: deltaDays(-daysBefore - 1), $lt: deltaDays(-daysBefore) },
  });
  if (twitters.length !== 0) {
    ctx.reply(
      (await Promise.all(twitters.map(t => t.toString()))).join('===='),
    );
  } else {
    ctx.reply('安娜啥都没说');
  }
}
