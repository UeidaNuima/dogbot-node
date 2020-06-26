import * as phantom from 'phantom';
import * as cheerio from 'cheerio';
import { CQImage, MessageEventListener } from 'cq-websocket';
import {
  split,
  saveImageFromBuffer,
  checkImageExist,
  getCardsInfo,
  RARITY,
} from '../util';
import bot from '../bot';
process.exit = (() => {
  return;
}) as () => never;
import { Command } from 'commander';

const WIKI_BASE_URL = 'http://wikiwiki.jp/aigiszuki/';

/**
 * Take a screenshot of the given wiki page
 * @param name card name
 */
export async function getStatusPic(name: string) {
  const instance = await phantom.create();
  const page = await instance.createPage();
  await page.property('viewportSize', { width: 800, height: 1 });
  await page.open(WIKI_BASE_URL + encodeURIComponent(name));
  const content = await page.property('content');

  const $: any = cheerio.load(content);
  if ($('textarea').length) {
    throw new Error('Missing Page!');
  }
  // tslint:disable
  await page.evaluate(function() {
    $('body').html($('#body').html());
    $('p').remove();
    $('h3:contains(クラス特性) + div')
      .nextAll()
      .remove();
    $('h3:contains(クラス特性) + a + div')
      .nextAll()
      .remove();
    const skill = $($('h3:contains(スキル)')[0]);
    while (skill.next()[0].nodeName !== 'H3') {
      skill.next().remove();
    }
    skill.remove();
  });

  const buffer = await page.renderBase64('png');
  instance.exit();
  return Buffer.from(buffer, 'base64');
}

const Card: MessageEventListener = async (event, ctx, tags) => {
  const program = new Command().option('-f, --refresh', 'Force refresh');
  program.parse(['', ...split(ctx.raw_message)]);
  const name = program.args[0];
  let index: number | undefined;
  if (program.args.length >= 2) {
    index = Number.parseInt(program.args[1], 10);
    if (Number.isNaN(index)) {
      return '索引位请输入数字';
    }
    if (index <= 0) {
      return '索引至少为1';
    }
  }

  let cardName: string;
  try {
    const cards = await getCardsInfo(name);
    if (cards.length > 1) {
      if (index) {
        if (index > cards.length) {
          return '索引越界';
        }
        cardName = cards[index - 1].Name;
      } else {
        return (
          `「${name}」不止一个单位，以下列出所有：\n` +
          cards
            .map(
              card =>
                `[${RARITY[card.Rare]}]${card.Name}` +
                (card.NickNames && card.NickNames.length !== 0
                  ? `(${card.NickNames.join(',')})`
                  : ''),
            )
            .join('\n')
        );
      }
    } else {
      cardName = cards[0].Name;
    }

    let imgPath: false | string = false;
    if (!program.refresh) {
      bot('send_msg', {
        ...ctx,
        message: `尝试从缓存中获取${cardName}的wiki截图...`,
      });
      imgPath = checkImageExist(cardName + '.png', 'unit');
    }
    if (!imgPath) {
      bot('send_msg', { ...ctx, message: `正在获取${cardName}的wiki截图...` });
      const imgBuffer = await getStatusPic(cardName);
      imgPath = await saveImageFromBuffer(imgBuffer, cardName + '.png', 'unit');
    }

    return [new CQImage(imgPath)];
  } catch (err) {
    console.error(err.stack);
    return err.message;
  }
};

export default Card;
