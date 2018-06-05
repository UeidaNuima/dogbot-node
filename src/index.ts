import { default as Bot } from 'dogq';
import Bark from './middleware/bark';
import Exp from './middleware/exp';
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
bot.use(Exp);

bot.start();
