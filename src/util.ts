import * as request from 'request-promise-native';
import * as fs from 'fs-extra';
import * as ini from 'ini';
import { join, dirname } from 'path';
import { getCard, getCards, getClass } from './apolloClient';
import { CardMeta, ClassMeta } from './model';
import config from './config';

const CQRoot: string = config.CQRoot;
const CQImageRoot = join(CQRoot, 'data', 'image');
export const RARITY = [
  '铜',
  '铁',
  '银',
  '金',
  '白',
  '黑',
  undefined,
  '蓝',
  undefined,
  undefined,
  '白英',
  '黑英',
];

/**
 * Split a string by spaces except in double quotes.
 * @param str string to be spilitted
 */
export function split(str: string) {
  if (!str) {
    return [];
  }
  const splitted = str.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
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
 * Save a buffer to a image.
 * @param file file buffer
 * @param filename image filename
 * @param dir dir the image will be saved to
 */
export async function saveImageFromBuffer(
  file: Buffer,
  filename: string,
  dir = '.',
) {
  const filenameWithPath = join(dir, filename);
  const realPath = join(CQImageRoot, filenameWithPath);
  await fs.ensureDir(dirname(realPath));
  await fs.writeFile(realPath, file);
  return filenameWithPath;
}

export function checkImageExist(filename: string, dir: string) {
  const filenameWithPath = join(dir, filename);
  const realPath = join(CQImageRoot, filenameWithPath);
  if (fs.existsSync(realPath)) {
    return filenameWithPath;
  }
  return false;
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

export async function getClassInfo(name?: string, id?: number) {
  if (id) {
    const classInfo1 = await getClass(undefined, id);
    if (classInfo1 && classInfo1.data.class) {
      return classInfo1.data.class;
    }
    throw new Error(`没有找到id为${id}的职业`);
  }
  const classInfo = await getClass(name);
  if (classInfo && classInfo.data.class) {
    return classInfo.data.class;
  }
  const classResp = await ClassMeta.findOne({ NickName: name });
  if (classResp) {
    const classInfo2 = await getClass(undefined, classResp.ClassID);
    if (classInfo2 && classInfo2.data.class) {
      return classInfo2.data.class;
    }
  }
  throw new Error('没有找到对应职业');
}

export async function getCardsInfo(name: string) {
  // is name a card name
  const cardsResp1 = await getCards({ name });
  if (cardsResp1 && cardsResp1.data.cards.length !== 0) {
    return cardsResp1.data.cards;
  }

  // is name a card nickName
  const cardResp2 = await CardMeta.findOne({ NickName: name });
  if (cardResp2) {
    const card = await getCard(cardResp2.CardID);
    if (card) {
      return [card.data.card];
    }
  }

  // is name a combination of rarity & class
  let className = name;
  let classID;

  // if first/second char is rarity
  let rarity = RARITY.findIndex(c => c === name[0]);
  if (rarity !== -1) {
    className = name.slice(1);
  } else if (name.length > 2) {
    rarity = RARITY.findIndex(c => c === name.slice(0, 2));
    if (rarity !== -1) {
      className = name.slice(2);
    }
  }

  // name is a class name
  const classResp1 = await getClass(className);
  if (classResp1 && classResp1.data.class) {
    classID = classResp1.data.class.ClassID;
  } else {
    // name is a class nickname
    const classResp2 = await ClassMeta.findOne({ NickName: className });
    if (classResp2) {
      classID = classResp2.ClassID;
    }
  }

  if (classID === undefined) {
    throw new Error(`没有找到职业<${className}>`);
  }

  // use classId to find card name
  const cardsResp = await getCards({ classID });
  if (cardsResp) {
    const cards = cardsResp.data.cards.filter(card =>
      rarity === -1 ? true : card.Rare === rarity,
    );
    if (cards.length === 0) {
      throw new Error(
        `在${
          rarity === -1 ? '' : `[${RARITY[rarity]}]`
        }<${className}>下一个单位都没有`,
      );
    }
    return cards;
  }

  throw new Error(`没找到单位${name}`);
}
