import { MessageEventListener } from 'cq-websocket';

const Help: MessageEventListener = () => {
  const helper = `ケルベロス ver4.1.0
  /twitter [几天以前]
  /exp 稀有度 初始等级 目标等级
  /exp 稀有度 x桶|x祝福[+x桶|+x祝福] 目标等级
  /emoji add 名称 图片
         del 名称 [序号]
         name  add 名称 新名称
               del 名称 [序号]
         group add 名称 [群号]
               del 名称 [群号]
         list 名称
  /poster [更新星期]
  /status [-f] 单位
  /conne [-s sorter] 单位|职业 [单位|职业 [...]]
  /material [-r] 职业
  /help
----
桶 => /exp
推特 => /twitter
海报 => /poster
属性图 => /status
圆爹 => /conne
素材 => /material`;
  return helper;
};

export default Help;
