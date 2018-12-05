import * as phantom from 'phantom';
import * as cheerio from 'cheerio';
import { Context, CQImage } from 'dogq';
import {
  split,
  saveImageFromBuffer,
  checkImageExist,
  getCardsInfo,
  RARITY,
} from '../util';
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
  const instance = await phantom.create(['--proxy=http://localhost:1087']);
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

const program = new Command().option('-f, --refresh', 'Force refresh');

const Card = async (ctx: Context) => {
  program.parse(['', '', ...split(ctx.match[1])]);
  // console.log(program.refresh);
  const name = program.args[0];
  let index: number | undefined;
  if (program.args.length >= 2) {
    index = Number.parseInt(program.args[1], 10);
    if (Number.isNaN(index)) {
      ctx.reply('索引位请输入数字');
      return;
    }
    if (index <= 0) {
      ctx.reply('索引至少为1');
      return;
    }
  }

  let cardName: string;
  try {
    const cards = (await getCardsInfo(name)).filter(
      card => card.SellPrice !== 0,
    );
    if (cards.length > 0) {
      if (index) {
        if (index > cards.length) {
          ctx.reply('索引越界');
          return;
        }
        cardName = cards[index - 1].Name;
      } else {
        ctx.reply(
          `「${name}」不止一个单位，以下列出所有：\n` +
            cards
              .map(
                card =>
                  `[${RARITY[card.Rare]}]${card.Name}` +
                  (card.NickName && card.NickName.length !== 0
                    ? `(${card.NickName.join(',')})`
                    : ''),
              )
              .join('\n'),
        );
        return;
      }
    } else {
      cardName = cards[0].Name;
    }

    let imgPath: false | string = false;
    if (!program.refresh) {
      ctx.reply(`尝试从缓存中获取${cardName}的wiki截图...`);
      imgPath = checkImageExist(cardName + '.png', 'unit');
    }
    if (!imgPath) {
      ctx.reply(`正在获取${cardName}的wiki截图...`);
      const imgBuffer = await getStatusPic(cardName);
      imgPath = await saveImageFromBuffer(imgBuffer, cardName + '.png', 'unit');
    }

    ctx.reply(new CQImage(imgPath).toString());
  } catch (err) {
    ctx.reply(err.message);
    ctx.bot.logger.error(err.stack);
  }
};

export default Card;
