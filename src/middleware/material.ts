import { Context } from 'dogq';
import { split, getClassInfo } from '../util';
import { getClassesByMaterial } from '../apolloClient';
process.exit = (() => {
  return;
}) as () => never;
import { Command } from 'commander';

const program = new Command().option('-r, --reverse', 'Reverse search');

const Material = async (ctx: Context) => {
  program.parse(['', '', ...split(ctx.match[1])]);
  const name = program.args[0];
  try {
    const classInfo = await getClassInfo(name);
    if (!program.reverse) {
      let CCMaterials: string[] = [];
      let AWMaterials: string[] = [];
      let orbs: string[] = [];

      if (!classInfo.JobChange) {
        ctx.reply(`职业[${classInfo.Name}]没有cc也没有觉醒`);
        return;
      }
      if (classInfo.MaxLevel === 50) {
        // if the change will be cc
        CCMaterials = CCMaterials.concat(
          classInfo.JobChangeMaterial.map(mat => mat.Name),
        );
        if (CCMaterials.length === 2) {
          // if length is 2, a same class siver unit will be used
          CCMaterials.push(classInfo.Name);
        }
        // get aw class info
        const awClassInfo = await getClassInfo(undefined, classInfo.JobChange);
        AWMaterials = AWMaterials.concat(
          awClassInfo.JobChangeMaterial.map(mat => mat.Name),
        );
        orbs = orbs.concat(awClassInfo.Data_ExtraAwakeOrb.map(mat => mat.Name));
      } else if (classInfo.MaxLevel === 80) {
        // if the change will be aw
        AWMaterials = AWMaterials.concat(
          classInfo.JobChangeMaterial.map(mat => mat.Name),
        );
        orbs = orbs.concat(classInfo.Data_ExtraAwakeOrb.map(mat => mat.Name));
      }
      let rep = `职业[${classInfo.Name}]`;
      if (CCMaterials.length !== 0) {
        rep += `\nCC素材：[${CCMaterials.join('][')}]`;
      }
      if (AWMaterials.length !== 0) {
        rep += `\n觉醒素材：[${AWMaterials.join('][')}]`;
      }
      if (orbs.length !== 0) {
        rep += `\n觉醒珠子：[${orbs.join('][')}]`;
      }
      ctx.reply(rep);
      return;
    } else {
      const {
        data: { classes },
      } = await getClassesByMaterial(classInfo.ClassID);
      if (classes.length > 0) {
        // const filteredClasses: typeof classes = [];
        // classes.forEach(c => {
        //   let flag = true;
        //   classes.forEach(c2 => {
        //     if (c2.JobChange === c.ClassID) {
        //       flag = false;
        //     }
        //   });
        //   if (flag) {
        //     filteredClasses.push(c);
        //   }
        // });
        ctx.reply(
          `以职业[${classInfo.Name}]为素材的有：\n[${classes
            .map(c => c.Name)
            .join('][')}]`,
        );
        return;
      }
      ctx.reply(`没有以职业[${classInfo.Name}]为素材的职业。`);
      return;
    }
  } catch (err) {
    ctx.reply(err.message);
    ctx.bot.logger.error(err.stack);
    return;
  }
};

export default Material;

// mongoose.connect('mongodb://localhost/test');

// const context = new Context({} as Bot, {} as RecvMessage);
// context.reply = (message: string) => {
//   console.log(message);
// };

// context.match = ['', 'ダークストーカー'];

// Material(context);
