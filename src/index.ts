import * as mongoose from 'mongoose';
import config from './config';
import Bark from './middleware/bark';
import Exp from './middleware/exp';
import Twitter from './middleware/twitter';
import Calc from './middleware/calc';
import {
  default as Emoji,
  replacer as EmojiReplacer,
} from './middleware/emoji';
import Help from './middleware/help';
import Poster from './middleware/poster';
import Card from './middleware/card';
import Conne from './middleware/conne';
import Material from './middleware/material';
import { createScheduleJobs } from './schedule';

import bot from './bot';

mongoose.connect(
  `mongodb://localhost/${config.db}`,
  { useNewUrlParser: true },
);
import './model';

createScheduleJobs(bot);

bot
  .on('socket.connecting', (socketType, attempts) => {
    console.log('嘗試第 %d 次連線 _(:з」∠)_', attempts);
  })
  .on('socket.connect', (socketType, sock, attempts) => {
    console.log('第 %d 次連線嘗試成功 ヽ(✿ﾟ▽ﾟ)ノ', attempts);
  })
  .on('socket.failed', (socketType, attempts) => {
    console.log('第 %d 次連線嘗試失敗 。･ﾟ･(つд`ﾟ)･ﾟ･', attempts);
  });

bot
  .on('message', async (event, ctx, tags) => {
    if (ctx.raw_message === '汪') {
      bot('send_msg', { ...ctx, message: '汪！' });
    }
  })
  .on('message', async (event, ctx, tags) => {
    // calc
    if (ctx.raw_message.startsWith('/calc')) {
      return Calc(event, ctx, tags);
    }

    // poster
    if (
      ctx.raw_message.startsWith('/poster') ||
      ctx.raw_message.startsWith('海报')
    ) {
      return await Poster(event, ctx, tags);
    }

    // exp
    if (
      ctx.raw_message.startsWith('/bucket') ||
      ctx.raw_message.startsWith('桶')
    ) {
      return await Exp(event, ctx, tags);
    }

    // conne
    if (
      ctx.raw_message.startsWith('/conne') ||
      ctx.raw_message.startsWith('圆爹')
    ) {
      return await Conne(event, ctx, tags);
    }

    // status
    if (
      ctx.raw_message.startsWith('/status') ||
      ctx.raw_message.startsWith('属性图')
    ) {
      return await Card(event, ctx, tags);
    }

    // material
    if (
      ctx.raw_message.startsWith('/material') ||
      ctx.raw_message.startsWith('素材')
    ) {
      return await Material(event, ctx, tags);
    }

    // twitter
    if (
      ctx.raw_message.startsWith('/twitter') ||
      ctx.raw_message.startsWith('推特')
    ) {
      return await Twitter(event, ctx, tags);
    }

    // twitter
    if (ctx.raw_message.startsWith('/emoji')) {
      return await Emoji(event, ctx, tags);
    }

    // help
    if (ctx.raw_message === '/help') {
      return await Help();
    }

    // replace emoji
    if (ctx.message_type === 'group') {
      return EmojiReplacer(event, ctx, tags);
    }

    return;
  });

bot.connect();
