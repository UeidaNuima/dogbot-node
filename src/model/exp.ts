import { Typegoose, prop } from 'typegoose';

export default class Exp extends Typegoose {
  @prop({ required: true })
  public lv: number;
  @prop({ required: true })
  public exp: number;
  @prop({ required: true })
  public rarity: number;
}
