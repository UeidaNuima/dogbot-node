import { default as Bot } from 'dogq';
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
import { createScheduleJobs } from './schedule';

mongoose.connect(`mongodb://localhost/${config.db}`);
import './model';

const bot = new Bot({ selfServerPort: 12455, debug: true });

createScheduleJobs(bot);

// Bark! Bark!
bot.on({ text: /汪/ }, Bark);

// Repace emoji
bot.use(EmojiReplacer);

// help
bot.on({ text: /^(?:\/help )(.*)$/ }, Help);

// emoticons
bot.on({ text: /^(?:\/emoji )(.*)$/ }, Emoji);

// count exp and buckets
bot.on({ text: /^(?:桶 |\/bucket )(.*)$/ }, Exp);

// search for recent twitter
bot.on({ text: /^(?:推特 |\/twitter )(.*)$/ }, Twitter);

// calculate the exlpression
bot.on({ text: /^(?:\/calc )(.*)$/ }, Calc);

// calculate the exlpression
bot.on({ text: /^(?:\/poster |海报 )(.*)$/ }, Poster);

// run!
bot.start();
