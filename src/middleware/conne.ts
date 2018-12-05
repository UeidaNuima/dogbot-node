import { Context, CQImage } from 'dogq';
import * as phantom from 'phantom';
import { split, getCardsInfo, saveImageFromBuffer } from '../util';
process.exit = (() => {
  return;
}) as () => never;
import { Command } from 'commander';

const CONNE_URL = 'http://www116.sakura.ne.jp/~kuromoji/aigis_dps.htm';
const SORTER_INDEX = {
  hp: 5,
  atk: 6,
  def: 7,
  mdef: 8,
  dps: 20,
};

/**
 * Take a screenshot of the given wiki page
 * @param name card name
 */
export async function getConnePic(names: string[], sorter?: string) {
  const instance = await phantom.create();
  const page = await instance.createPage();
  await page.property('viewportSize', { width: 800, height: 1 });
  await page.open(CONNE_URL);
  // const content = await page.property('content');

  const $: any = {};

  const sorterIndex = sorter && SORTER_INDEX[sorter];

  // tslint:disable
  await page.evaluate(
    function(names, sorterIndex) {
      $(
        '.aigis_dps_switch, .menu_header, .mediaTableMenu, div[style="margin-top: 0.5em;"]',
      ).remove();
      $($('.container')[1]).remove();
      names.forEach(function(name) {
        $('tr:contains(' + name + ')').css('display', 'table-row');
      });
      if (sorterIndex) {
        $('#sorter-mediaTableCol-' + sorterIndex)
          .click()
          .click();
      }
    },
    names,
    sorterIndex,
  );

  const buffer = await page.renderBase64('png');
  // await page.render('233.png');
  instance.exit();
  return Buffer.from(buffer, 'base64');
}

const program = new Command().option('-s, --sort <sorter>');

const Conne = async (ctx: Context) => {
  program.parse(['', '', ...split(ctx.match[1])]);
  const sorter: string | undefined = program.sort;

  // unavaliable sorters
  if (sorter && !SORTER_INDEX[sorter]) {
    ctx.reply(`[${sorter}]不为[dps, hp, atk, def, mdef]之一`);
    return;
  }

  let results: Array<{
    Name: string;
    CardID: number;
    SellPrice: number;
    Rare: number;
    NickName: string[];
    ConneName: string;
  }> = [];
  for (const name of program.args) {
    try {
      results = results.concat(await getCardsInfo(name));
    } catch (err) {
      ctx.reply(err.message);
      console.error(err.stack);
    }
  }

  results = results.filter(card => {
    // if (card.SellPrice === 0) {
    //   // non-units
    //   return false;
    // }
    if (card.Rare <= 2) {
      // conne site doesn't have units' rarity lower then gold
      return false;
    }
    if (!card.ConneName) {
      // no conne name
      ctx.reply(`[${card.Name}]还没有添加圆爹名`);
      return false;
    }
    return true;
  });

  if (results.length === 0) {
    ctx.reply('一个单位都没有');
    return;
  }

  ctx.reply('正在获取圆爹截图...');

  const imgBuffer = await getConnePic(
    results.map(result => result.ConneName),
    sorter,
  );
  const imgPath = await saveImageFromBuffer(imgBuffer, 'conne.png');
  ctx.reply(new CQImage(imgPath).toString());
  // console.log('ok');
};

export default Conne;
