import { default as Bot, Level } from 'dogq';
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
import Debugger from './middleware/debugger';
import { createScheduleJobs } from './schedule';

mongoose.connect(`mongodb://localhost/${config.db}`);
import './model';

const bot = new Bot({ selfServerPort: 12455, logLevel: Level.DEBUG });

createScheduleJobs(bot);

if (process.env.BOT_ENV !== 'product') {
  bot.logger.info('Bot is running under debug mode!');
  bot.use(Debugger);
}

// Bark! Bark!
bot.on({ text: /汪/ }, Bark);

// Repace emoji
bot.use(EmojiReplacer);

// help
bot.on({ text: /^(?:\/help)(.*)$/ }, Help);

// emoticons
bot.on({ text: /^(?:\/emoji )(.*)$/ }, Emoji);

// count exp and buckets
bot.on({ text: /^(?:桶 |\/bucket )(.*)$/ }, Exp);

// search for recent twitter
bot.on({ text: /^(?:推特 |\/twitter )(.*)$/ }, Twitter);
bot.on({ text: /^(?:推特|\/twitter)$/ }, Twitter);

// calculate the exlpression
bot.on({ text: /^(?:\/calc )(.*)$/ }, Calc);

// calculate the exlpression
bot.on({ text: /^(?:\/poster |海报 )(.*)$/ }, Poster);
bot.on({ text: /^(?:\/poster|海报)$/ }, Poster);

// take a wiki screenshot
bot.on({ text: /^(?:\/status |属性图 )(.*)$/ }, Card);

// take a conne screenshot
bot.on({ text: /^(?:\/conne |圆爹 )(.*)$/ }, Conne);

// get material infomation
bot.on({ text: /^(?:\/material |素材 )(.*)$/ }, Material);

// run!
bot.start();
