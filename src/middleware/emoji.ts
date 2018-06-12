import { Context, CQImage, RecvReplyableMessage } from 'dogq';
import { split, getCQImage, replaceAsync, choose } from '../util';
import { Emoji } from '../model';

export async function replacer(ctx: Context, next: any) {
  const message = ctx.message as RecvReplyableMessage;
  let isReplaced = false;
  async function replaceCallback(...args: any[]) {
    let name: string;
    const origin: string = args[args.length - 1];
    if (args.length === 3) {
      name = args[0];
    } else {
      name = args[1];
    }
    let emoji;
    if (message.type === 'RecvGroupMessage') {
      emoji = await Emoji.findOne({ name, group: message.group });
    } else {
      emoji = await Emoji.findOne({ name });
    }

    if (emoji) {
      isReplaced = true;
      return new CQImage(`emoji/${choose(emoji.emoji)}`).toString();
    } else {
      return origin;
    }
  }

  // bucket replace
  let replaced = await replaceAsync(
    message.text,
    /[(（](.*?)[）)]/g,
    replaceCallback,
  );

  // full text replace
  if (!isReplaced) {
    replaced = await replaceAsync(message.text, /^.*$/, replaceCallback);
  }

  // response if replaced otherwise just go through
  if (isReplaced) {
    ctx.reply(replaced);
  } else {
    await next();
  }
}

export default async (ctx: Context) => {
  const [mainCommand, ...argv] = split(ctx.match[1]);
  if (mainCommand === 'add') {
    // add emoji
    const [name, emojiStr] = argv;
    if (!name || !emojiStr) {
      ctx.reply('兄啊格式不对');
      return;
    }

    let targetEmoji = await Emoji.findOne({ name });
    if (!targetEmoji) {
      // create new emoji instance
      targetEmoji = new Emoji({ name: [name] });
      if (ctx.message.type === 'RecvGroupMessage') {
        targetEmoji.group.push(ctx.message.group);
      }
    } else {
      // from group && group id not in record
      if (
        ctx.message.type === 'RecvGroupMessage' &&
        targetEmoji.group.indexOf(ctx.message.group) === -1
      ) {
        ctx.reply(
          `这个表情组不在该群空间下，请尝试/emoji addgroup ${
            ctx.message.group
          }`,
        );
        return;
      }
    }

    const image = CQImage.PATTERN.exec(emojiStr);
    if (!image) {
      ctx.reply('图呢？没JB你说个图啊');
      return;
    }
    const imageFilename = image[1];
    await getCQImage(imageFilename);
    targetEmoji.emoji.push(imageFilename);
    await targetEmoji.save();
    if (targetEmoji.emoji.length <= 10) {
      ctx.reply(
        `现在[${targetEmoji.name.join()}]含有以下的表情：${targetEmoji.emoji
          .map(emoji => new CQImage(`emoji/${emoji}`).toString())
          .join('')}`,
      );
    } else {
      ctx.reply(
        `现在[${targetEmoji.name.join()}]含有${
          targetEmoji.emoji.length
        }个表情。`,
      );
    }
  } else if (mainCommand === 'del' || mainCommand === 'remove') {
    // remove emoji by index
    const [name, indexStr] = argv;
    const index = Number.parseInt(indexStr) - 1;
    if (!name || Number.isNaN(index) || index < 0) {
      ctx.reply('兄啊格式不对');
      return;
    }
    const targetEmoji = await Emoji.findOne({ name });
    if (!targetEmoji || index >= targetEmoji.emoji.length) {
      ctx.reply('没…没找到???');
      return;
    }
    await Emoji.update(
      { _id: targetEmoji._id },
      { $unset: { [`emoji.${index}`]: 1 } },
    );
    await Emoji.update({ _id: targetEmoji._id }, { $pull: { emoji: null } });
    ctx.reply(`从${targetEmoji.name.join()}里删掉了第${index + 1}个表情`);
  } else if (mainCommand === 'alias') {
    // alias
    const [subCommand, ...subArgv] = argv;
    if (!(subCommand === 'add') && !(subCommand === 'del')) {
      ctx.reply('兄啊格式不对');
      return;
    }
    const [dest, src] = subArgv;
    const targetEmoji = await Emoji.findOne({ name: dest });
    if (!targetEmoji) {
      ctx.reply('不存在这个表情组');
      return;
    }
    if (subCommand === 'add') {
      // add alias
      if (
        targetEmoji.name.indexOf(src) !== -1 ||
        (await Emoji.findOne({ name: src }))
      ) {
        ctx.reply('已经存在这个名称了');
        return;
      }
      targetEmoji.name.push(src);
      await targetEmoji.save();
    } else if (subCommand === 'del') {
      // remove alias
      if (targetEmoji.name.indexOf(src) === -1) {
        ctx.reply('这个表情组不含有这个名称');
        return;
      }
      await Emoji.update({ _id: targetEmoji._id }, { $pull: { name: src } });
    }
    ctx.reply(`该表情组现在的触发名称为${targetEmoji.name.join()}`);
  } else if (mainCommand === 'group') {
    // group
    const [subCommand, ...subArgv] = argv;
    if (!(subCommand === 'add') && !(subCommand === 'del')) {
      ctx.reply('兄啊格式不对');
      return;
    }
    const [
      dest,
      src = ctx.message.type === 'RecvGroupMessage' ? ctx.message.group : null,
    ] = subArgv;
    const targetEmoji = await Emoji.findOne({ name: dest });
    if (!targetEmoji) {
      ctx.reply('不存在这个表情组');
      return;
    }
    if (!src) {
      ctx.reply('请键入群组');
      return;
    }

    if (subCommand === 'add') {
      // add group to emoji
      if (targetEmoji.group.indexOf(src) !== -1) {
        ctx.reply('已经存在这个群组了');
        return;
      }
      targetEmoji.group.push(src);
      await targetEmoji.save();
    } else if (subCommand === 'del') {
      // remove emoji to group
      if (targetEmoji.group.indexOf(src) === -1) {
        ctx.reply('这个表情组中不存在这个群组');
        return;
      }
      await Emoji.update({ _id: targetEmoji._id }, { $pull: { group: src } });
    }
    ctx.reply(`该表情组现在的存在的群组为${targetEmoji.group.join()}`);
  }
};
