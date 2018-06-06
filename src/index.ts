import { default as Bot } from 'dogq';
import Bark from './middleware/bark';
import Exp from './middleware/exp';
import Twitter from './middleware/twitter';
import Calc from './middleware/calc';
import { db } from './model';
import { createScheduleJobs } from './schedule';

const bot = new Bot({ selfServerPort: 12455, debug: true });

db.on('error', () => {
  bot.logger.error('Connect to mongodb error!');
  process.exit(1);
});
bot.context.db = db;

createScheduleJobs(bot);

/// Bark! Bark!
bot.use(Bark);

// count exp and buckets
bot.on({ text: /^(?:\/桶 |\/bucket)(.*)$/ }, Exp);

// search for recent twitter
bot.on({ text: /^(?:\/推特 |\/twitter)(.*)$/ }, Twitter);

// calculate the exlpression
bot.on({ text: /^(?:\/calc)(.*)$/ }, Calc);

// run!
bot.start();
