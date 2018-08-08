import Bot, { CQAt } from 'dogq';
export default function maintenanceAnnounce(
  bot: Bot,
  groups: any[],
  target: string,
) {
  for (const group of groups) {
    bot.send({
      type: 'SentGroupMessage',
      group,
      text: `${new CQAt('all')}距离${target}维护还有一个小时整，亏亿警告`,
    });
  }
}
