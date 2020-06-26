import { MessageEventListener } from 'cq-websocket';

const Bark: MessageEventListener = () => {
  return '汪!';
};

export default Bark;
