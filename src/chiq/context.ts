import Bot from '.';
import {
  RecvMessage,
  SentPrivateMessage,
  SentGroupMessage,
  SentDiscussMessage,
} from './cqsdk';

export default class Context {
  public bot: Bot;
  public message: RecvMessage;
  public match: any[];

  constructor(bot: Bot, message: RecvMessage) {
    this.bot = bot;
    this.message = message;
  }

  /**
   * Reply to the sender.
   * @param text reply text
   */
  public reply(text: string) {
    switch (this.message.type) {
      case 'RecvPrivateMessage':
        this.bot.send({
          type: 'SentPrivateMessage',
          QQ: this.message.QQ,
          text,
        } as SentPrivateMessage);
        return;
      case 'RecvGroupMessage':
        this.bot.send({
          type: 'SentGroupMessage',
          QQ: this.message.QQ,
          group: this.message.group,
          text,
        } as SentGroupMessage);
        return;
      case 'RecvDiscussMessage':
        this.bot.send({
          type: 'SentDiscussMessage',
          QQ: this.message.QQ,
          discuss: this.message.discuss,
          text,
        } as SentDiscussMessage);
        return;
      default:
        this.bot.logger.error('Replied unreplyable message.');
    }
  }
}
