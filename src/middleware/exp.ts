import { Context } from 'dogq';
import { Exp } from '../model';
import { split } from '../util';

const RARITY = '铜铁银金白黑蓝';
// ikusei fairy fix
const IKUSEI_FIX = 1.1;
// per exp of a platinum bucket
const BUCKET_EXP = 8000;
// per exp of a small bless fairy
const BLESS_EXP = {
  2: 4000,
  3: 18000,
  4: 19000,
  5: 20000,
  6: 19000,
};

/**
 * Sum up the exp from srartLv to endLv with the given rarity.
 * @param rarity
 * @param startLv
 * @param endLv
 */
async function sumUpExp(rarity: number, startLv: number, endLv: number) {
  const exp = await Exp.aggregate([
    { $match: { $and: [{ rarity }, { lv: { $gte: startLv, $lt: endLv } }] } },
    { $group: { _id: null, sumExp: { $sum: '$exp' } } },
  ]);
  return exp[0].sumExp as number;
}

/**
 * Calculate what level can be fullfilled once by given buckets and bless fairies
 * @param rarity
 * @param endLv
 * @param bucket number of platinum bucket
 * @param bless  number of small bless fairy
 * @param ikusei whether use ikusei fairy
 */
export async function countStart(
  rarity: number,
  endLv: number,
  bucket = 0,
  bless = 0,
  ikusei = false,
) {
  if (endLv >= 100) {
    throw Error('兄啊比99级还大了是什么鬼');
  }

  if (!bucket && !bless) {
    throw Error('兄啊没桶没小祝福你想算啥啊');
  }

  let sumExp = bucket * BUCKET_EXP;
  if (bless) {
    if (rarity < 2) {
      throw Error('兄啊这个稀有度有个naizi小祝福');
    }
    sumExp += bless * BLESS_EXP[rarity];
  }

  if (ikusei) {
    sumExp *= IKUSEI_FIX;
  }

  for (let currentLv = endLv - 1; currentLv > 0; currentLv--) {
    const exp = await sumUpExp(rarity, currentLv, endLv);
    if (exp >= sumExp) {
      const currentLvSumExp = await Exp.findOne({ rarity, lv: currentLv });
      // skip type check of null
      if (currentLvSumExp) {
        return {
          lv: currentLv,
          remainExp: (currentLvSumExp.exp - (exp - sumExp)).toFixed(0),
        };
      }
    }
  }
  throw Error('兄啊经验超出范围了');
}

/**
 * Count platinum buckets and give suggestion for best time to have platinum buckets.
 * @param rarity
 * @param startLv
 * @param endLv
 * @param ikusei whether use ikusei fairy
 */
export async function countBucket(
  rarity: number,
  startLv: number,
  endLv: number,
  ikusei = false,
) {
  if (startLv >= endLv) {
    throw Error('兄啊等级反了');
  }
  if (endLv >= 100) {
    throw Error('兄啊比99级还大了是什么鬼');
  }
  const perBucketExp = ikusei ? BUCKET_EXP * 1.1 : BUCKET_EXP;
  // sum the total exp from startLv to endLv
  const exp = await sumUpExp(rarity, startLv, endLv);
  // float bucket
  const bucket = exp / perBucketExp;
  return {
    suggestion:
      Math.floor(bucket) === 0
        ? undefined
        : await countStart(
            rarity,
            endLv,
            Math.floor(bucket),
            undefined,
            ikusei,
          ),
    bucket,
  };
}

export default async (ctx: Context) => {
  // const message = ctx.message as RecvReplyableMessage;
  let rarity: number;
  let startLv: number | undefined;
  const factor = {
    bucket: 0,
    bless: 0,
  };
  let endLv: number;

  const [r, m, e] = split(ctx.match[1]);
  if (!(r && m && e)) {
    ctx.reply('兄啊格式不对');
    return;
  }

  rarity = RARITY.search(r);
  if (rarity === -1) {
    ctx.reply('兄啊你这是什么稀有度');
    return;
  }

  endLv = Number.parseInt(e);
  if (Number.isNaN(rarity)) {
    ctx.reply('兄啊输数字啊');
    return;
  }

  try {
    if (m.search(/桶|祝福/) !== -1) {
      // defined factor
      const factors = m.split('+');
      factors.forEach((f: string) => {
        if (f.search('桶') !== -1) {
          factor.bucket += Number.parseFloat(f.replace(/桶/, ''));
        } else {
          factor.bless += Number.parseFloat(f.replace(/祝福/, ''));
        }
      });
    } else {
      startLv = Number.parseInt(m);
      if (Number.isNaN(startLv)) {
        ctx.reply('兄啊输数字啊');
        return;
      }
    }
  } catch (err) {
    ctx.reply(err.message);
    return;
  }

  if (startLv !== undefined) {
    async function genMsg(rr: number, slv: number, elv: number, i: boolean) {
      try {
        const res = await countBucket(rr, slv, elv, i);
        let replyMsg = `[${
          i ? BUCKET_EXP * IKUSEI_FIX : BUCKET_EXP
        }]${res.bucket.toFixed(2)}个`;
        if (res.suggestion) {
          replyMsg += `, ${res.suggestion.lv}到下一级${
            res.suggestion.remainExp
          }经验${Math.floor(res.bucket)}个`;
        }
        return replyMsg;
      } catch (err) {
        return err.message;
      }
    }
    const replyMsgAll = (await Promise.all([
      genMsg(rarity, startLv, endLv, true),
      genMsg(rarity, startLv, endLv, false),
    ])).join('\n');
    ctx.reply(replyMsgAll);
    return;
  } else {
    async function genMsg(
      rr: number,
      elv: number,
      f: { bucket: number; bless: number },
      i: boolean,
    ) {
      try {
        const res = await countStart(rr, elv, f.bucket, f.bless, i);
        return `[${i ? BUCKET_EXP * IKUSEI_FIX : BUCKET_EXP}]${
          res.lv
        }级别到下一级${res.remainExp}经验`;
      } catch (err) {
        return err.message;
      }
    }
    const replyMsgAll = (await Promise.all([
      genMsg(rarity, endLv, factor, true),
      genMsg(rarity, endLv, factor, false),
    ])).join('\n');
    ctx.reply(replyMsgAll);
    return;
  }
};
