import {
  default as Emoji,
  replacer as EmojiReplacer,
} from '../src/middleware/emoji';
import { Context, default as Bot } from 'dogq';
import './setup';

const bot = new Bot();
const ctx = new Context(bot, {
  type: 'RecvPrivateMessage',
  QQ: '1',
  text: 'sb',
  message: '',
});
// ctx.match = ['', 'add text [CQ:image,file=test.png]'];
ctx.reply = function(msg) {
  this.msg = msg;
};

it('should add a emoji', async () => {
  expect.assertions(1);
  ctx.message = {
    type: 'RecvGroupMessage',
    QQ: '1',
    group: '2',
    text: '',
    message: '',
  };
  ctx.match = ['', 'add test [CQ:image,file=test.png]'];
  await Emoji(ctx);
  await Emoji(ctx);
  expect(ctx.msg).toEqual(
    '现在[test]含有以下的表情：[CQ:image,file=emoji/test.png][CQ:image,file=emoji/test.png]',
  );
  ctx.msg = '';
});

it('should reply a emoji', async () => {
  expect.assertions(2);
  ctx.message = {
    type: 'RecvGroupMessage',
    QQ: '1',
    group: '2',
    text: 'foo(test)bar',
    message: '',
  };
  await EmojiReplacer(ctx, async () => console.log('nexted'));
  expect(ctx.msg).toEqual('foo[CQ:image,file=emoji/test.png]bar');
  ctx.message = {
    type: 'RecvGroupMessage',
    QQ: '1',
    group: '2',
    text: 'test',
    message: '',
  };
  await EmojiReplacer(ctx, async () => console.log('nexted'));
  expect(ctx.msg).toEqual('[CQ:image,file=emoji/test.png]');
  ctx.msg = '';
});

it('should remove a emoji', async () => {
  expect.assertions(2);
  ctx.match = ['', 'del test 2'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('从test里删掉了第2个表情');
  ctx.match = ['', 'del test 2'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('没…没找到???');
  ctx.msg = '';
});
