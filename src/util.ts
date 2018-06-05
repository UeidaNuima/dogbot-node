import * as request from 'request-promise-native';
import * as fs from 'fs-extra';
import { join } from 'path';
import config from './config';

const CQRoot: string = config.CQRoot;
const CQImageRoot = join(CQRoot, 'data', 'image');

/**
 * Split a string by spaces except in double quotes.
 * @param str string to be spilitted
 */
export function split(str: string) {
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
) {
  const filename: string = url.split('/').pop() || 'dummy';
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
    });
    await fs.writeFile(realPath, img);
  }

  return filenameWithPath;
}
