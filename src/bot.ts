import { CQWebSocket } from 'cq-websocket';
import config from './config';
export default new CQWebSocket({
  host: config.host || '127.0.0.1',
  port: config.port || 6700,
});
