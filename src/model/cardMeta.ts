import { Typegoose, arrayProp, prop } from 'typegoose';

export default class CardMeta extends Typegoose {
  @prop({ required: true })
  public CardID: number;

  @arrayProp({ items: String })
  public NickNames?: string[];

  @prop()
  public ConneName?: string;
}
