import { MessageEventListener, CQAt } from 'cq-websocket';
import { split, choose, getRandomArbitrary } from '../util';

const Roll: MessageEventListener = (event, ctx, tags) => {
  const [_, param] = split(ctx.raw_message);
  if (param && param.includes(',')) {
    const choices = param.split(',');
    return new CQAt(ctx.user_id).toString() + ' ' + choose(choices);
  } else {
    const num = Number.parseInt(param) || 100;
    return (
      new CQAt(ctx.user_id).toString() +
      ' ' +
      getRandomArbitrary(0, num).toString()
    );
  }
};

export default Roll;
