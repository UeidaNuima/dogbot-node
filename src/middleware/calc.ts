import { Context } from 'dogq';

/**
 * Give the answer to the given equation
 */
export default async function calc(ctx: Context) {
  const eq = ctx.match[1];
  const match = eq.match(/[0-9\(\)\+\-\*\/\^\&\%\|\.\~\<\> ]+/);
  if (match) {
    try {
      ctx.reply(eval(match[0].replace(/\^/, '**')));
    } catch {
      ctx.reply('菅　野　美　穂');
    }
  }
}
