import { Context } from 'dogq';

export default async (ctx: Context, next: () => Promise<any>) => {
  if (ctx.message.type === 'RecvPrivateMessage') {
    await next();
  }
};
