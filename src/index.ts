import { default as Bot } from 'dogq';
import * as mongoose from 'mongoose';
import Bark from './middleware/bark';
import Exp from './middleware/exp';
import Twitter from './middleware/twitter';
import Calc from './middleware/calc';
import {
  default as Emoji,
  replacer as EmojiReplacer,
} from './middleware/emoji';
// import { db } from './model';
import { createScheduleJobs } from './schedule';

// db.on('error', () => {
//   bot.logger.error('Connect to mongodb error!');
//   process.exit(1);
// });
// bot.context.db = db;

mongoose.connect('mongodb://localhost/aigis');
import './model';

const bot = new Bot({ selfServerPort: 12455, debug: true });

createScheduleJobs(bot);

// Bark! Bark!
bot.on({ text: /汪/ }, Bark);

// Repace emoji
bot.use(EmojiReplacer);

// emoticons
bot.on({ text: /^(?:\/emoji )(.*)$/ }, Emoji);

// count exp and buckets
bot.on({ text: /^(?:桶 |\/bucket )(.*)$/ }, Exp);

// search for recent twitter
bot.on({ text: /^(?:推特 |\/twitter )(.*)$/ }, Twitter);

// calculate the exlpression
bot.on({ text: /^(?:\/calc)(.*)$/ }, Calc);

// run!
bot.start();
