import Poster from '../src/middleware/poster';
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

it('should reply the newest poster', async () => {
  expect.assertions(1);
  ctx.match = ['', ''];
  await Poster(ctx);
  expect(ctx.msg).toEqual('[CQ:image,file=poster\\event20180607.jpg]');
});

it('should reply 404 for the wrong day', async () => {
  expect.assertions(2);
  ctx.match = ['', '1'];
  await Poster(ctx);
  expect(ctx.msg).toEqual('已将更新日期设置为星期1');
  ctx.match = ['', ''];
  await Poster(ctx);
  expect(ctx.msg).toEqual('拉不到图…可能是网络问题或者日期不太对？');
});
