import ExpSchema from './exp';
import TwitterSchema from './twitter';
import YoutubeSchema from './youtube';
import EmojiSchema from './emoji';
import CardMetaSchema from './cardMeta';
import ClassMetaSchema from './classMeta';

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

export const Youtube = new YoutubeSchema().getModelForClass(YoutubeSchema, {
  schemaOptions: {
    collection: 'youtube',
  },
});

export const Emoji = new EmojiSchema().getModelForClass(EmojiSchema, {
  schemaOptions: {
    collection: 'emoji',
  },
});

export const CardMeta = new CardMetaSchema().getModelForClass(CardMetaSchema, {
  schemaOptions: {
    collection: 'cardMeta',
  },
});

export const ClassMeta = new ClassMetaSchema().getModelForClass(
  ClassMetaSchema,
  {
    schemaOptions: {
      collection: 'classMeta',
    },
  },
);
