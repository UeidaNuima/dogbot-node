import * as mongoose from 'mongoose';
import config from './config';
import Exp from './middleware/exp';
import Twitter from './middleware/twitter';
import Calc from './middleware/calc';
import { default as Emoji, EmojiReplacer } from './middleware/emoji';
import Help from './middleware/help';
import Poster from './middleware/poster';
import Card from './middleware/card';
import Conne from './middleware/conne';
import Material from './middleware/material';
import Roll from './middleware/roll';
import { createScheduleJobs } from './schedule';
import { register } from './util';
import bot from './bot';

mongoose.connect(config.mongodbURL, { useNewUrlParser: true });
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
    console.log(ctx.raw_message);
    if (ctx.raw_message === '汪') {
      await bot('send_msg', { ...ctx, message: '汪！' });
    }
  })
  .on('message', register('calc', Calc))

  .on('message', register('poster', Poster))
  .on('message', register('海报', Poster, false))

  .on('message', register('bucket', Exp))
  .on('message', register('桶', Exp, false))

  .on('message', register('conne', Conne))
  .on('message', register('圆爹', Conne, false))

  .on('message', register('status', Card))
  .on('message', register('属性图', Card, false))

  .on('message', register('material', Material))
  .on('message', register('素材', Material, false))

  .on('message', register('twitter', Twitter))
  .on('message', register('推特', Twitter, false))

  .on('message', register('help', Help))

  .on('message', register('emoji', Emoji))

  .on('message', register('roll', Roll))

  .on('message.group', EmojiReplacer);

bot.connect();
