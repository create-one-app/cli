import cac from 'cac';
import inquirer from 'inquirer';
import shell from 'shelljs';
import { fs, path } from 'zx';
import pkg from '../package.json';

const cli = cac('coa');

cli.option('--url [repository]', 'custom git repository', {
  default: '',
});

// Display help message when `-h` or `--help` appears
cli.help();
// Display version number when `-v` or `--version` appears
// It's also used in help message
cli.version(pkg.version);

// console.log(cli.parse());

const { options } = cli.parse();

if (options.url) {
  console.log('action');
} else if ('h' in options || 'v' in options) {
  process.exit(1);
} else {
  const templates = {
    'solid-ts': {
      url: 'https://github.com/xiamu14/pure-typescript-package.git',
      desc: 'solid-js 的脚手架，使用 typescript 和 vite',
    },
    'command-line-ts': {
      url: '',
      desc: '命令行工具脚手架，使用 typescript 和 esm',
    },
  };

  const templateSelects = Object.keys(templates).map((key) => {
    const template = templates[key];
    return `[${key}] ${template.desc}`;
  });

  // select

  inquirer
    .prompt([
      {
        type: 'list',
        name: 'template',
        message: '选择模版?',
        choices: templateSelects,
      },
    ])
    .then(async (answers) => {
      console.info('Answer:', answers.template);
      const keyMatch = answers.template.match(/^\[(\S+)\]/);
      if (keyMatch) {
        const key = keyMatch[1];
        const template = templates[key];
        console.info(template);

        await fs.mkdir(path.resolve(process.cwd(), './.cache'));
        const { url } = template;
        //检查控制台是否以运行`git `开头的命令
        if (!shell.which('git')) {
          //在控制台输出内容
          shell.echo('Sorry, this script requires git');
          shell.exit(1);
        }

        //即同步运行外部工具
        if (
          shell.exec(
            `git clone ${url} ${path.resolve(
              process.cwd(),
              `./.cache/${key}`,
            )}`,
          ).code !== 0
        ) {
          // loading
          shell.exit(1);
        }
      } else {
        console.error('代码运行错误，获取模版 key 错误');
        process.exit(1);
      }
    });
}
