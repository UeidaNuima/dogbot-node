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

export default async function twitter(event: any, ctx: any, tags: any) {
  const [_, param] = split(ctx.raw_message);
  const daysBefore = param ? Number.parseInt(param, 10) : 0;
  if (Number.isNaN(daysBefore) || daysBefore < 0) {
    return '兄啊格式不对';
  }
  let screenName: string;
  if (config.aigisGroups.includes(ctx.group_id)) {
    screenName = 'Aigis1000';
  } else if (config.gfGroups.includes(ctx.group_id)) {
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
    return await Promise.all(twitters.map(t => t.toArray()));
  } else {
    return '莫得推特';
  }
}
