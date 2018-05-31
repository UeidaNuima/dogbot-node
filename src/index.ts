import Bot from './chiq';
import { Level } from './chiq/logger';
// import * as cq from './chiq/cqsdk';

const bot = new Bot({ logLevel: Level.ALL });

// debug logger
// bot.use(async (ctx, next) => {
//   ctx.bot.logger.debug(`↘ ${ctx.message.message}`);
//   await next();
// });

bot.start();
