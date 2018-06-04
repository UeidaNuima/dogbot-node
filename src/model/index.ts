import ExpSchema from './exp';

export const Exp = new ExpSchema().getModelForClass(ExpSchema, {
  schemaOptions: {
    collection: 'exp'
  }
});