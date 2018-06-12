import {
  default as bucket,
  countStart,
  countBucket,
} from '../src/middleware/exp';
import { Context, default as Bot } from 'dogq';
import './setup';

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

it('should calculate the exact start lv', async () => {
  expect.assertions(2);
  await expect(countStart(4, 50, 1)).resolves.toEqual({
    lv: 41,
    remainExp: 281,
  });
  await expect(countStart(4, 50, 1, undefined, true)).resolves.toEqual({
    lv: 40,
    remainExp: 259,
  });
});

it('should throw error when exp too much', async () => {
  expect.assertions(2);
  await expect(countStart(4, 50, 3)).rejects.toThrowError();
  await expect(countStart(4, 50, undefined, 2)).rejects.toThrowError();
});

it('should calculate the exact number of bucket', async () => {
  expect.assertions(2);
  await expect(countBucket(4, 1, 60)).resolves.toEqual({
    suggestion: { lv: 11, remainExp: 42 },
    bucket: 4.08325,
  });
  await expect(countBucket(4, 59, 60)).resolves.toEqual({
    suggestion: undefined,
    bucket: 0.201625,
  });
});

it('should throw error when startLv >= endLv', async () => {
  expect.assertions(1);
  await expect(countBucket(4, 60, 1)).rejects.toThrowError();
});
