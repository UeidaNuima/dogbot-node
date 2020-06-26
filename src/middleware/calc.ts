import { MessageEventListener } from 'cq-websocket';

/**
 * Give the answer to the given equation
 */
const Calc: MessageEventListener = async (event, ctx, tags) => {
  const eq = tags[0].data.text.toString().replace(/\/calc/, '');
  const match = eq.match(/[0-9\(\)\+\-\*\/\^\&\%\|\.\~\<\> ]+/);
  if (match) {
    try {
      return eval(match[0].replace(/\^/, '**')).toString();
    } catch {
      return '解　読　不　能';
    }
  }
};

export default Calc;
