import { CQImage } from 'cq-websocket';
import * as phantom from 'phantom';
import { split, getCardsInfo, saveImageFromBuffer } from '../util';
import bot from '../bot';
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
  await page.property('viewportSize', { width: 1200, height: 1 });
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
      // $('#sorter-mediaTableCol-1').click();
      if (sorterIndex) {
        $('#sorter-mediaTableCol-' + sorterIndex)
          .click()
          .click();
      }
    },
    names,
    sorterIndex,
  );
  // tslint:enable

  const buffer = await page.renderBase64('png');
  // await page.render('233.png');
  instance.exit();
  return Buffer.from(buffer, 'base64');
}

const Conne = async (event: any, ctx: any, tags: any[]) => {
  const program = new Command().option('-s, --sort <sorter>');
  program.parse(['', ...split(ctx.raw_message)]);
  const sorter: string | undefined = program.sort;

  // unavaliable sorters
  if (sorter && !SORTER_INDEX[sorter]) {
    return `[${sorter}]不为[dps, hp, atk, def, mdef]之一`;
  }

  let results: Array<{
    Name: string;
    CardID: number;
    SellPrice: number;
    Rare: number;
    NickNames: string[];
    ConneName: string;
  }> = [];
  for (const name of program.args) {
    try {
      results = results.concat(await getCardsInfo(name));
    } catch (err) {
      console.error(err.stack);
      return err.message;
    }
  }

  results = results.filter(card => {
    if (card.Rare <= 2) {
      // conne site doesn't have units' rarity lower then gold
      return false;
    }
    if (!card.ConneName) {
      // no conne name
      bot('send_msg', { ...ctx, message: `[${card.Name}]还没有添加圆爹名` });
      return false;
    }
    return true;
  });

  if (results.length === 0) {
    return '一个单位都没有';
  }

  bot('send_msg', { ...ctx, message: '正在获取圆爹截图...' });

  const imgBuffer = await getConnePic(
    results.map(result => result.ConneName),
    sorter,
  );
  const imgPath = await saveImageFromBuffer(imgBuffer, 'conne.png');
  return [new CQImage(imgPath)];
};

export default Conne;
