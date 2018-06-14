import { Context } from 'dogq';

export default async (ctx: Context) => {
  const helper = `ケルベロス ver4.0.0
  /twitter [几天以前]
  /exp <稀有度> <初始等级>|<x桶|x祝福> <目标等级>
  /emoji add <名称> <图片>
         del <名称> [序号]
         name  add <名称> <新名称>
               del <名称> [序号]
         group add <名称> [群号]
               del <名称> [群号]
         list <名称>
  /poster [更新星期]
  /help
----
桶 => /exp
推特 => /twitter
海报 => /poster`;
  ctx.reply(helper);
};
