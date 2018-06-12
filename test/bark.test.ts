import bark from '../src/middleware/bark';
import { Context, default as Bot } from 'dogq';

const bot = new Bot();
const ctx = new Context(bot, {
  type: 'RecvPrivateMessage',
  QQ: '1',
  text: 'sb',
  message: '',
});
ctx.reply = function(msg) {
  this.msg = msg;
};

it('should reply 汪!', () => {
  expect.assertions(1);
  return bark(ctx, () => Promise.resolve()).then(() => {
    expect(ctx.msg).toEqual('汪!');
  });
});
