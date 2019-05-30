/**
 * Give the answer to the given equation
 */
export default async function calc(event: any, ctx: any, tags: any[]) {
  const eq = tags[0].data.text.replace(/\/calc/, '');
  const match = eq.match(/[0-9\(\)\+\-\*\/\^\&\%\|\.\~\<\> ]+/);
  if (match) {
    try {
      return eval(match[0].replace(/\^/, '**')).toString();
    } catch {
      return '解　読　不　能';
    }
  }
}
