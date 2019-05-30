import { CQAt, CQText } from 'cq-websocket';
export default function maintenanceAnnounce(
  bot: any,
  groups: any[],
  target: string,
) {
  for (const group of groups) {
    bot('send_group_msg', {
      group_id: group,
      message: [
        new CQAt('all' as any),
        new CQText(`距离${target}维护还有一个小时整，亏亿警告`),
      ],
    });
  }
}
