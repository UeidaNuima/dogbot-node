import { default as Bot } from 'dogq';
import Bark from './middleware/bark';
import Exp from './middleware/exp';
import * as mongoose from 'mongoose';


const bot = new Bot({ selfServerPort: 12455 });

mongoose.connect('mongodb://localhost/aigis');
mongoose.connection.on('error', () => {
  bot.logger.error('Connect to mongodb error!');
  process.exit(1);
})

// register models to default connection
import './model';

/// Bark! Bark!
bot.use(Bark);

// count exp and buckets
bot.use(Exp);

bot.start();
