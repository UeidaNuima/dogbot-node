import { default as Bot, RecvPrivateMessage } from '../../dog';

const bot = new Bot();

// a simple repeat bot
bot.on({ type: 'RecvPrivateMessage' }, async (ctx) => {
  const message = ctx.message as RecvPrivateMessage;
  ctx.bot.logger.info(`↘ ${message.text}`);
  ctx.reply(message.text);
});

bot.start();
