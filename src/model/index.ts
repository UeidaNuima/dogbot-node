import ExpSchema from './exp';
import TwitterSchema from './twitter';
import EmojiSchema from './emoji';
// import * as mongoose from 'mongoose';

// export const db = mongoose.createConnection('mongodb://localhost/aigis');

export const Exp = new ExpSchema().getModelForClass(ExpSchema, {
  schemaOptions: {
    collection: 'exp',
  },
});

export const Twitter = new TwitterSchema().getModelForClass(TwitterSchema, {
  schemaOptions: {
    collection: 'twitter',
  },
});

export const Emoji = new EmojiSchema().getModelForClass(EmojiSchema, {
  schemaOptions: {
    collection: 'emoji',
  },
});
