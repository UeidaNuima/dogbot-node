import { CQImage, MessageEventListener } from 'cq-websocket';
import { downloadImage } from '../util';

let updateDay = 4;
const BASE_URL =
  'http://s3-ap-northeast-1.amazonaws.com/assets.millennium-war.net/00/html/image/';

/**
 * Format a date to a string with the format yyyymmdd.
 */
function yyyymmdd(date: Date) {
  // https://stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object
  const mm = date.getMonth() + 1; // getMonth() is zero-based
  const dd = date.getDate();
  return [
    date.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd,
  ].join('');
}

const Poster: MessageEventListener = async (
  event: any,
  ctx: any,
  tags: any[],
) => {
  const dayStr = ctx.raw_message.replace(/海报/, '').replace(/\/poster/, '');
  if (dayStr) {
    const day = Number.parseInt(dayStr, 10);
    if (Number.isNaN(day) || day < 0 || day > 6) {
      ctx.reply('兄啊星期不对');
      return;
    } else {
      updateDay = day;
      ctx.reply(`已将更新日期设置为星期${updateDay}`);
      return;
    }
  }

  const date = new Date();

  if (date.getDay() >= updateDay) {
    date.setDate(date.getDate() + updateDay - date.getDay());
  } else {
    date.setDate(date.getDate() + updateDay - date.getDay() - 7);
  }
  const filename = `event${yyyymmdd(date)}.jpg`;
  try {
    const filenameWithPath = await downloadImage(
      `${BASE_URL}${filename}`,
      'poster',
      true,
      filename,
    );
    return [new CQImage(filenameWithPath)];
  } catch (err) {
    return '拉不到图…可能是网络问题或者日期不太对？';
  }
};

export default Poster;
