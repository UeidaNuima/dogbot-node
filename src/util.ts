/**
 * Split a string by spaces except in double quotes.
 * @param str string to be spilitted
 */
export function split(str: string) {
  const splitted = str.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  return splitted.map(factor => factor.replace(/"/g, ''));
}
