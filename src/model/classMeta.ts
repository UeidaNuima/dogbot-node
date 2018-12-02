import { Typegoose, arrayProp, prop } from 'typegoose';

export default class ClassMeta extends Typegoose {
  @prop({ required: true })
  public ClassID: number;

  @arrayProp({ items: String })
  public NickName?: string[];

  @prop()
  public CnName?: string;
}
