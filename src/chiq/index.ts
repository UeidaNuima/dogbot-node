import { default as Logger, Level } from './logger';
import Context from './context';
import { createSocket, Socket } from 'dgram';
import * as cq from './cqsdk';
import * as compose from 'koa-compose';
import { Middleware } from 'koa-compose';

// export type Middleware = (ctx: any, next: Middleware) => Promise<void> | void;

/**
 * Constructor config interface.
 */
export interface Config {
  targetServerPort?: number;
  selfServerPort?: number;
  logLevel?: Level;
}

export interface Matcher {
  type?: string;
  QQ?: string;
  groupID?: string;
  discussID?: string;
  operatedQQ?: string;
  text?: RegExp | string;
}

/**
 * The main bot class.
 */
export default class Bot {
  public logger: Logger;
  public context: object = {};
  private middleware: Array<Middleware<Context>> = [];
  private server: Socket = createSocket('udp4');
  private client: Socket = createSocket('udp4');
  private targetServerPort: number;
  private selfServerPort: number;

  constructor(config: Config) {
    const {
      targetServerPort = 11235,
      selfServerPort = 12450,
      logLevel,
    } = config;
    this.targetServerPort = targetServerPort;
    this.selfServerPort = selfServerPort;
    this.logger = new Logger(logLevel);
  }

  /**
   * Send message to coolq host.
   * @param message message string that will be sent
   */
  public send(message: cq.SentMessage) {
    // encode the message and send
    const encodedMessage = cq.encodeMessage(message);
    // log the send message
    this.logger.debug(`↗ ${encodedMessage}`);
    this.client.send(
      encodedMessage,
      this.targetServerPort,
      'localhost',
      err => {
        // err will be Error or null
        if (err) {
          this.logger.error(err.message);
        }
        this.client.close();
      },
    );
  }

  /**
   * Add a middleware.
   * @param middleware middleware function
   */
  public use(middleware: Middleware<Context>) {
    this.middleware.push(middleware);
  }

  /**
   * Add a match middleware.
   * @param filter filter conditions
   * @param middleware middleware function
   */
  public on(matcher: Matcher, middleware: Middleware<Context>) {
    this.middleware.push(async (ctx: Context, next: () => Promise<any>) => {
      let matched = true;
      Object.keys(matcher).forEach(key => {
        if (
          key !== 'text' &&
          ctx.message[key] &&
          matcher[key] &&
          ctx.message[key] !== matcher[key]
        ) {
          matched = false;
        }
        // use regexp for text
        if (key === 'text' && 'text' in ctx.message && matcher.text) {
          let pattern = matcher.text;
          if (typeof pattern === 'string') {
            pattern = new RegExp(pattern);
          }
          const match = ctx.message.text.match(pattern);
          if (match) {
            Object.assign(ctx, { match });
          } else {
            matched = false;
          }
        }
      });
      if (matched) {
        await middleware(ctx, next);
      } else {
        await next();
      }
    });
  }

  /**
   * Start the server.
   */
  public start() {
    // compose all the middlewares
    const fn = compose(this.middleware);

    this.logger.info(`Server is listening at :${this.selfServerPort}`);
    this.server.on('message', (msg: Buffer) => {
      // decode message
      const message = cq.decodeMessage(msg.toString());
      // create context
      const ctx = new Context(this, message);
      // assign user-defined context to ctx
      Object.assign(ctx, this.context);
      // log the receive message
      this.logger.debug(`↘ ${message.message}`);
      // response
      fn(ctx);
    });

    // heart beat for every 30 seconds
    this.send({ type: 'SentClientHello', port: this.selfServerPort });
    setInterval(() => {
      this.send({ type: 'SentClientHello', port: this.selfServerPort });
    }, 30000);

    // start the server
    this.server.bind(this.selfServerPort);
  }
}
