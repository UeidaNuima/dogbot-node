import { Typegoose, prop } from 'typegoose';

export default class Emoji extends Typegoose {
  @prop({ required: true })
  public name: string[];
  @prop({ default: [] })
  public emoji: string[];
  @prop({ default: [] })
  public group: string[];
}
