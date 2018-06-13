import { Typegoose, arrayProp } from 'typegoose';

export default class Emoji extends Typegoose {
  @arrayProp({ required: true, items: String })
  public name: string[];
  @arrayProp({ default: [], items: String })
  public emoji: string[];
  @arrayProp({ default: [], items: String })
  public group: string[];
}
