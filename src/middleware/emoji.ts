import { CQImage, MessageEventListener } from 'cq-websocket';
import { split, replaceAsync, choose, downloadImage } from '../util';
import { Emoji } from '../model';

function imgConverter(imgStr: string) {
  const match = /^.*\.(png|jpg|jpeg|gif)$/.exec(imgStr);
  if (match) {
    return new CQImage(`emoji/${imgStr}`).toString();
  } else {
    return imgStr;
  }
}

/**
 * Replace (name) or a single name to cqimg and reply
 */
export const EmojiReplacer: MessageEventListener = async (event, ctx, tags) => {
  let isReplaced = false;
  async function replaceCallback(...args: any[]) {
    let name: string;
    const origin: string = args[0];
    if (args.length === 3) {
      name = args[0];
    } else {
      name = args[1];
    }
    let emoji;
    emoji = await Emoji.findOne({ name, group: ctx.group_id });

    if (emoji) {
      isReplaced = true;
      return imgConverter(choose(emoji.emoji));
    } else {
      return origin;
    }
  }

  // bracket replace
  let replaced = await replaceAsync(
    ctx.raw_message,
    /[(（]([^()（）]+?)[）)]/g,
    replaceCallback,
  );

  // full text replace
  if (!isReplaced) {
    replaced = await replaceAsync(ctx.raw_message, /^.*$/, replaceCallback);
  }

  // response if replaced otherwise just go through
  if (isReplaced) {
    return replaced;
  } else {
    return;
  }
};

const EmojiMiddleware: MessageEventListener = async (
  event: any,
  ctx: any,
  tags: any[],
) => {
  const [_, mainCommand, ...argv] = split(ctx.raw_message);
  if (mainCommand === 'add') {
    // add emoji
    const [name, emojiStr] = argv;
    if (!name || !emojiStr) {
      return '兄啊格式不对';
    }

    let targetEmoji = await Emoji.findOne({ name });
    if (!targetEmoji) {
      targetEmoji = new Emoji({ name: [name] });
      if (ctx.message.type === 'RecvGroupMessage') {
        targetEmoji.group.push(ctx.group_id);
      }
    } else {
      // from group && group id not in record
      if (
        ctx.message.type === 'RecvGroupMessage' &&
        targetEmoji.group.indexOf(ctx.group_id) === -1
      ) {
        return `这个表情组不在这个群空间下，请尝试/emoji addgroup ${ctx.group_id}`;
      }
    }

    let image: CQImage | undefined;
    for (const tag of tags) {
      if (tag instanceof CQImage) {
        image = tag;
        break;
      }
    }
    // const image = CQImage.PATTERN.exec(emojiStr);
    if (!image) {
      // direct add text if no image
      const match = /^.*\.(png|jpg|jpeg|gif)$/.exec(emojiStr);
      if (match) {
        return '兄啊不要加图片扩展名的文字';
      }
      targetEmoji.emoji.push(emojiStr);
    } else {
      // await getCQImage(imageFilename, 'emoji');
      await downloadImage(image.data.url as string, 'emoji', true, image.data
        .file as string);
      targetEmoji.emoji.push(image.data.file as string);
    }

    await targetEmoji.save();
    if (targetEmoji.emoji.length <= 10) {
      return `现在[${targetEmoji.name.join()}]含有以下的表情：${targetEmoji.emoji
        .map(imgConverter)
        .join('|')}`;
    } else {
      return `现在[${targetEmoji.name.join()}]含有${
        targetEmoji.emoji.length
      }个表情。`;
    }
  } else if (mainCommand === 'del') {
    // remove emoji by index
    const [name, indexStr] = argv;
    const targetEmoji = await Emoji.findOne({ name });
    if (!name) {
      return '兄啊名称呢';
    }
    if (!targetEmoji) {
      return '没找到这个名称的表情组…';
    }
    if (indexStr !== undefined) {
      const index = Number.parseInt(indexStr, 10) - 1;
      if (
        Number.isNaN(index) ||
        index < 0 ||
        index >= targetEmoji.emoji.length
      ) {
        return '索引不太对劲';
      }
      if (targetEmoji.emoji.length === 1) {
        return '无法删除组中的最后一个表情';
      }
      await Emoji.update(
        { _id: targetEmoji._id },
        { $unset: { [`emoji.${index}`]: 1 } },
      );
      await Emoji.update({ _id: targetEmoji._id }, { $pull: { emoji: null } });
      return `从[${targetEmoji.name.join()}]表情组里删掉了第${index + 1}个表情`;
    } else {
      await Emoji.remove({ name });
      return `[${targetEmoji.name.join()}]表情组被删掉了`;
    }
  } else if (mainCommand === 'name') {
    // alias
    const [subCommand, ...subArgv] = argv;
    if (!(subCommand === 'add') && !(subCommand === 'del')) {
      return '兄啊副指令呢';
    }
    const [dest, src] = subArgv;
    const targetEmoji = await Emoji.findOne({ name: dest });
    if (!targetEmoji) {
      return '不存在这个表情组';
    }
    if (subCommand === 'add') {
      // add alias
      if (
        targetEmoji.name.indexOf(src) !== -1 ||
        (await Emoji.findOne({ name: src }))
      ) {
        return '已经存在这个名称了';
      }
      targetEmoji.name.push(src);
      await targetEmoji.save();
      return `这个表情组现在的触发名称为[${targetEmoji.name.join()}]`;
    } else if (subCommand === 'del') {
      // remove alias
      if (targetEmoji.name.indexOf(src) === -1) {
        return '这个表情组不含有这个名称';
      }
      if (targetEmoji.name.length === 1) {
        return '无法删除组中的最后一个名称…';
      }
      await Emoji.update({ _id: targetEmoji._id }, { $pull: { name: src } });
      return `这个表情组现在不会被${src}触发了`;
    }
  } else if (mainCommand === 'group') {
    // group
    const [subCommand, ...subArgv] = argv;
    if (!(subCommand === 'add') && !(subCommand === 'del')) {
      return '兄啊格式不对';
    }
    const [
      dest,
      src = ctx.message.type === 'RecvGroupMessage' ? ctx.message.group : null,
    ] = subArgv;
    const targetEmoji = await Emoji.findOne({ name: dest });
    if (!targetEmoji) {
      return '不存在这个表情组';
    }
    if (!src) {
      return '请键入群组';
    }

    if (subCommand === 'add') {
      // add group to emoji
      if (targetEmoji.group.indexOf(src) !== -1) {
        return '已经存在这个群组了';
      }
      targetEmoji.group.push(src);
      await targetEmoji.save();
      return `[${targetEmoji.name.join()}]表情组现在的存在的群组为${targetEmoji.group.join()}`;
    } else if (subCommand === 'del') {
      // remove emoji to group
      if (targetEmoji.group.indexOf(src) === -1) {
        return `[${targetEmoji.name.join()}]表情组中不存在这个群组`;
      }
      await Emoji.update({ _id: targetEmoji._id }, { $pull: { group: src } });
      return `从[${targetEmoji.name.join()}]表情组删除了群组${src}`;
    }
  } else if (mainCommand === 'list') {
    const [name] = argv;
    if (name) {
      const targetEmoji = await Emoji.findOne({ name });
      if (targetEmoji) {
        if (targetEmoji.emoji.length <= 10) {
          return `[${targetEmoji.name.join()}]含有以下的表情：${targetEmoji.emoji
            .map((emoji, index) => `[${index + 1}]>` + imgConverter(emoji))
            .join('')}\n该表情所在的群组为${targetEmoji.group.join(',')}`;
        } else {
          return `现在[${targetEmoji.name.join()}]含有${
            targetEmoji.emoji.length
          }个表情`;
        }
      } else {
        return '没找到这个名称的表情组…';
      }
    } else {
      let targetEmojis;
      if (ctx.message.type === 'RecvGroupMessage') {
        targetEmojis = await Emoji.find({ group: ctx.message.group });
      } else {
        targetEmojis = await Emoji.find();
      }
      if (targetEmojis.length !== 0) {
        return targetEmojis.map(emoji => emoji.name.join(',')).join('|');
      } else {
        return '该群组下还没有表情，可以使用/emoji add <名称> <图片>添加';
      }
    }
  }
  return '兄啊没有这个指令';
};

export default EmojiMiddleware;
