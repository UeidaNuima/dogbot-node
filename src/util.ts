import * as request from 'request-promise-native';
import * as fs from 'fs-extra';
import * as ini from 'ini';
import { join } from 'path';
import config from './config';

const CQRoot: string = config.CQRoot;
const CQImageRoot = join(CQRoot, 'data', 'image');

/**
 * Split a string by spaces except in double quotes.
 * @param str string to be spilitted
 */
export function split(str: string) {
  if (!str) {
    return [];
  }
  const splitted = str.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  return splitted.map(factor => factor.replace(/"/g, ''));
}

/**
 * Download a picture to cq folder.
 * @param url the image's url
 * @param path short path for cq magic picture
 * @returns filename with short path
 */
export async function downloadImage(
  url: string,
  path?: string,
  checkExist = true,
  filename?: string,
) {
  filename = filename || url.split('/').pop() || 'dummy';
  const filenameWithPath = path ? join(path, filename) : filename;
  const realPath = join(CQImageRoot, filenameWithPath);

  // ensure image dir
  if (path) {
    await fs.ensureDir(join(CQImageRoot, path));
  }

  // download
  if (!(checkExist && (await fs.pathExists(realPath)))) {
    const img = await request.get({
      url,
      proxy: process.env.proxy ? process.env.proxy : undefined,
      encoding: null,
    });
    await fs.writeFile(realPath, img);
  }

  return filenameWithPath;
}

/**
 * Download a user sent image to cqimg folder.
 * @param filename image filename
 * @param dir dir the image will be downloaded to
 */
export async function getCQImage(filename: string, dir: string) {
  const path = join(CQImageRoot, filename + '.cqimg');
  const CQImgFile = await fs.readFile(path, 'utf-8');
  const url = ini.parse(CQImgFile).image.url;
  return await downloadImage(url, dir, true, filename);
}

/**
 * Async type of String.prototype.replace() function.
 * @param str string to be replaced
 * @param re pattern, accept string or RegExp
 * @param callback callback funtion for dealing with matched strings
 */
export function replaceAsync(
  str: string,
  re: RegExp | string,
  callback: (...args: Array<string | number>) => Promise<string>,
) {
  // https://stackoverflow.com/questions/33631041/javascript-async-await-in-replace
  // http://es5.github.io/#x15.5.4.11
  str = String(str);
  const parts = [];
  let i = 0;
  if (re instanceof RegExp) {
    if (re.global) {
      re.lastIndex = i;
    }
    let m;
    while ((m = re.exec(str))) {
      parts.push(
        str.slice(i, m.index),
        callback.apply(null, [...m, m.index, m.input]),
      );
      i = re.lastIndex;
      if (!re.global) {
        i = m[0].length;
        break;
      } // for non-global regexes only take the first match
      if (m[0].length === 0) {
        re.lastIndex++;
      }
    }
  } else {
    re = String(re);
    i = str.indexOf(re);
    parts.push(str.slice(0, i), callback.apply(null, [re, i, str]));
    i += re.length;
  }
  parts.push(str.slice(i));
  return Promise.all(parts).then(strings => {
    return strings.join('');
  });
}

export function choose(arr: any[]) {
  if (arr.length === 0) {
    return null;
  }
  const index = Math.floor(Math.random() * Math.floor(arr.length));
  return arr[index];
}
