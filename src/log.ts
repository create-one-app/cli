import chalk from 'chalk';
import emojic from 'emojic';

const log = {
  error: (msg: string) => {
    console.log(`${emojic.x} ${chalk.rgb(242, 171, 177)(msg)}`);
  },
  warn: (msg: string) => {
    console.log(`${emojic.warning} ${chalk.rgb(241, 163, 120)(msg)}`);
  },
  success: (msg: string) => {
    console.log(`${emojic.whiteCheckMark} ${chalk.rgb(138, 145, 183)(msg)}`);
  },
};

export default log;
