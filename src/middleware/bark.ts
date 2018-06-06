import { Context } from 'dogq';

export default async (ctx: Context, next: () => Promise<any>) => {
  ctx.reply('汪!');
  await next();
};
