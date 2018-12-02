import * as phantom from 'phantom';
import * as cheerio from 'cheerio';
import { Context, default as Bot, CQImage } from 'dogq';
import gql from 'graphql-tag';
import * as mongoose from 'mongoose';
import { split, saveImageFromBuffer, checkImageExist } from '../util';
import client from '../apolloClient';
import { CardMeta, ClassMeta } from '../model';
process.exit = (() => {
  console.log(233);
}) as () => never;
import * as program from 'commander';

const WIKI_BASE_URL = 'http://wikiwiki.jp/aigiszuki/';
const RARITY = ['铜', '铁', '银', '金', '白', '黑', undefined, '蓝'];

async function getCards(args: { name?: string; classID?: number }) {
  return client.query<{
    cards: Array<{
      Name: string;
      CardID: number;
      SellPrice: number;
      Rare: number;
      NickName: string[];
    }>;
  }>({
    query: gql`
      query($Name: String, $ClassID: Int) {
        cards(Name: $Name, InitClassID: $ClassID) {
          CardID
          Name
          SellPrice
          Rare
          NickName
        }
      }
    `,
    variables: {
      Name: args.name,
      ClassID: args.classID,
    },
  });
}

async function getCard(CardID: number) {
  return client.query<{
    card: { Name: string; CardID: number; SellPrice: number };
  }>({
    query: gql`
      query($CardID: Int!) {
        card(CardID: $CardID) {
          CardID
          Name
          SellPrice
        }
      }
    `,
    variables: {
      CardID,
    },
  });
}

async function getClass(name: string) {
  return client.query<{
    classes: Array<{
      ClassID: number;
      Name: string;
    }>;
  }>({
    query: gql`
      query($Name: String!) {
        classes(Name: $Name) {
          ClassID
          Name
        }
      }
    `,
    variables: {
      Name: name,
    },
  });
}

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

program.option('-f, --refresh', 'Force refresh');

// getStatusPic('霊麟幻獣使シンフー');

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
  let target: string | undefined;

  // is name a card name
  const cardsResp = await getCards({ name });

  if (cardsResp) {
    let cards = cardsResp.data.cards.filter(card => card.SellPrice !== 0);
    if (cards.length !== 0) {
      target = cards[cards.length - 1].Name;
    }
  }

  // is name a card nickName
  if (!target) {
    const cardResp = await CardMeta.findOne({ NickName: name });
    if (cardResp) {
      const card = await getCard(cardResp.CardID);
      if (card) {
        target = card.data.card.Name;
      }
    }
  }

  // is name a combination of rarity & class
  if (!target) {
    let className = name;
    let classID;

    // if first char is rarity
    const rarity = RARITY.findIndex(c => c === name[0]);
    if (rarity !== -1) {
      className = name.slice(1);
    }
    // name is a class name
    const classResp = await getClass(className);
    if (classResp && classResp.data.classes.length !== 0) {
      classID = classResp.data.classes[0].ClassID;
    } else {
      // name is a class nickname
      if (!classID) {
        const classResp = await ClassMeta.findOne({ NickName: className });
        if (classResp) {
          classID = classResp.ClassID;
        }
      }
    }
    if (!classID) {
      ctx.reply('没找到这是啥…');
      return;
    }
    // use classId to find card name
    const cardsResp = await getCards({ classID });
    if (cardsResp && cardsResp.data.cards.length !== 0) {
      const cards = cardsResp.data.cards.filter(card =>
        rarity === -1 ? true : card.Rare === rarity,
      );
      if (cards.length === 0) {
        ctx.reply('没有这个稀有度&&这个职业的单位！');
        return;
      } else if (cards.length > 1 && !index) {
        const rep =
          `「${name}」不止一个单位，以下列出所有：\n` +
          cards
            .map(
              card =>
                `[${RARITY[card.Rare]}]${card.Name}` +
                (card.NickName && card.NickName.length !== 0
                  ? `(${card.NickName.join(',')})`
                  : ''),
            )
            .join('\n');
        ctx.reply(rep);
        return;
      }
      if (index && index >= cards.length) {
        ctx.reply('索引越界');
        return;
      }
      target = cards[index ? index : 0].Name;
    }
  }

  if (!target) {
    ctx.reply('兄啊你输的是个啥？');
    return;
  }

  let imgPath: false | string = false;
  if (!program.refresh) {
    ctx.reply(`尝试从缓存中获取${target}的wiki截图...`);
    imgPath = checkImageExist(target + '.png', 'unit');
  }
  if (!imgPath) {
    ctx.reply(`正在获取${target}的wiki截图...`);
    const imgBuffer = await getStatusPic(target);
    imgPath = await saveImageFromBuffer(imgBuffer, target + '.png', 'unit');
  }

  ctx.reply(new CQImage(imgPath).toString());
};

export default Card;

const bot = new Bot();
const ctx = new Context(bot, {
  type: 'RecvPrivateMessage',
  QQ: '1',
  text: 'sb',
  message: '',
});
ctx.reply = function(msg) {
  console.log(msg);
};
ctx.match = ['', '咕咕 -f'];

mongoose.connect(`mongodb://localhost/test`);

Card(ctx);
