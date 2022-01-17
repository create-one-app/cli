#!/usr/bin/env node

import cac from 'cac';
import inquirer from 'inquirer';
import shell from 'shelljs';
import { fileURLToPath } from 'url';
import { fs, path } from 'zx';
import log from './log.js';
import { getTemplates } from './templates.js';

const curWorkDir = process.cwd();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { version } = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'),
);

const cacheDir = path.resolve(curWorkDir, './.coa_cache');

const cli = cac('coa');

cli
  .command('new [project]', 'creat new app')
  .option('--url [repository]', 'custom git repository', {
    default: '',
  })
  .action((project, options) => {
    if (!project) {
      log.error('请输入项目名，模版将复制到该项目名的目录下');
      process.exit(1);
    }

    const projectDir = path.resolve(curWorkDir, `./${project}`);

    // NOTE: 判断目录是否已存在
    if (fs.existsSync(projectDir)) {
      log.error(`项目：${project} 已存在，请修改项目名`);
      process.exit(1);
    }

    const { url } = options;
    if (url) {
      create({ project, url, projectDir });
    } else {
      selectTemplate().then((url) => {
        create({ project, url, projectDir });
      });
    }
  });

// Display help message when `-h` or `--help` appears
cli.help();
// Display version number when `-v` or `--version` appears
// It's also used in help message
cli.version(version);

cli.parse();

function create({
  project,
  url,
  projectDir,
}: {
  project: string;
  url: string;
  projectDir: string;
}) {
  if (!shell.which('git')) {
    //在控制台输出内容
    log.error('Sorry, this script requires git');
    shell.exit(1);
  }

  const projectCache = path.resolve(cacheDir, `./${project}`);

  shell.exec(`git clone ${url} ${projectCache} -q`, function (code) {
    if (code !== 0) {
      process.exit(1);
    } else {
      fs.copySync(projectCache, projectDir, {
        filter: (src) => {
          return !/\.git/.test(src);
        },
      });
      fs.removeSync(cacheDir);
      log.success('项目已生成');
    }
  });
}

async function selectTemplate() {
  const templates = (await getTemplates()) as any;

  const templateSelects = Object.keys(templates).map((key) => {
    const template = templates[key];
    return `[${key}] ${template.desc}`;
  });

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: '选择模版?',
      choices: templateSelects,
    },
  ]);

  const keyMatch = answers.template.match(/^\[(\S+)\]/);
  if (keyMatch) {
    const key = keyMatch[1];
    const template = templates[key];

    await fs.mkdir(cacheDir);
    const { url } = template;
    return url;
    //检查控制台是否以运行`git `开头的命令
  } else {
    log.error('代码运行错误，获取模版 key 错误');
    process.exit(1);
  }
}
