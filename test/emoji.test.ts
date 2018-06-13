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
  expect.assertions(2);
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
  ctx.match = ['', 'add test2 [CQ:image,file=test.png]'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual(
    '现在[test2]含有以下的表情：[CQ:image,file=emoji/test.png]',
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

it('should add a group', async () => {
  expect.assertions(2);
  ctx.message = {
    type: 'RecvGroupMessage',
    QQ: '',
    group: '3',
    text: '',
    message: '',
  };
  ctx.match = ['', 'group add test'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('[test]表情组现在的存在的群组为2,3');
  await Emoji(ctx);
  expect(ctx.msg).toEqual('已经存在这个群组了');
  ctx.msg = '';
});

it('should remove a group', async () => {
  ctx.message = {
    type: 'RecvGroupMessage',
    QQ: '',
    group: '3',
    text: '',
    message: '',
  };
  ctx.match = ['', 'group del test'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('从[test]表情组删除了群组3');
  await Emoji(ctx);
  expect(ctx.msg).toEqual('[test]表情组中不存在这个群组');
  ctx.msg = '';
});

it('should add a name', async () => {
  // expect.assertions(2);
  ctx.message = {
    type: 'RecvGroupMessage',
    QQ: '',
    group: '3',
    text: '',
    message: '',
  };
  ctx.match = ['', 'name add test fuck'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('这个表情组现在的触发名称为[test,fuck]');
  await Emoji(ctx);
  expect(ctx.msg).toEqual('已经存在这个名称了');
  ctx.msg = '';
});

it('should remove a name', async () => {
  expect.assertions(3);
  ctx.message = {
    type: 'RecvGroupMessage',
    QQ: '',
    group: '3',
    text: '',
    message: '',
  };
  ctx.match = ['', 'name del test fuck'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('这个表情组现在不会被fuck触发了');
  await Emoji(ctx);
  expect(ctx.msg).toEqual('这个表情组不含有这个名称');
  ctx.match = ['', 'name del test test'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('无法删除组中的最后一个名称…');
  ctx.msg = '';
});

it('should list emojis', async () => {
  expect.assertions(2);
  ctx.message = {
    type: 'RecvGroupMessage',
    QQ: '',
    group: '2',
    text: '',
    message: '',
  };
  ctx.match = ['', 'list'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('test|test2');
  ctx.match = ['', 'list test'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual(
    '[test]含有以下的表情：[1]>[CQ:image,file=emoji/test.png][2]>[CQ:image,file=emoji/test.png]\n该表情所在的群组为2',
  );
  ctx.msg = '';
});

it('should remove a emoji', async () => {
  expect.assertions(4);
  ctx.match = ['', 'del test 2'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('从[test]表情组里删掉了第2个表情');
  ctx.match = ['', 'del test 2'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('索引不太对劲。。');
  ctx.match = ['', 'del test 1'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('无法删除组中的最后一个表情…请不要添加索引再次尝试');
  ctx.match = ['', 'del test'];
  await Emoji(ctx);
  expect(ctx.msg).toEqual('[test]表情组被删掉了');
  ctx.msg = '';
});
