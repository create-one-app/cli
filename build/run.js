#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import cac from 'cac';
import inquirer from 'inquirer';
import shell from 'shelljs';
import { fs, path } from 'zx';
import templates from './templates';
const curWorkDir = process.cwd();
const { version } = JSON.parse(fs.readFileSync(path.resolve(curWorkDir, './package.json'), 'utf-8'));
// console.log(version);
const cacheDir = path.resolve(curWorkDir, './.coa_cache');
const cli = cac('coa');
cli
    .command('new [project]', 'creat new app')
    .option('--url [repository]', 'custom git repository', {
    default: '',
})
    .action((project, options) => {
    // console.log('project', project);
    if (!project) {
        console.log('请输入项目名，模版将复制到该目录下');
        process.exit(1);
    }
    const projectDir = path.resolve(curWorkDir, `./${project}`);
    // NOTE: 判断目录是否已存在
    if (fs.existsSync(projectDir)) {
        console.log(`项目：${project} 已存在，请修改项目名`);
        process.exit(1);
    }
    const { url } = options;
    if (url) {
        create({ project, url, projectDir });
    }
    else {
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
function create({ project, url, projectDir, }) {
    if (!shell.which('git')) {
        //在控制台输出内容
        shell.echo('Sorry, this script requires git');
        shell.exit(1);
    }
    const projectCache = path.resolve(cacheDir, `./${project}`);
    shell.exec(`git clone ${url} ${projectCache} -q`, function (code) {
        if (code !== 0) {
            // console.log('Program output:', stdout);
            // console.log('Program stderr:', stderr);
            process.exit(1);
        }
        else {
            // TODO: copy file
            // console.log('Exit code:', code);
            fs.copySync(projectCache, projectDir, {
                filter: (src) => {
                    return !/\.git/.test(src);
                },
            });
            fs.removeSync(cacheDir);
            console.log('项目已生成');
        }
    });
}
function selectTemplate() {
    return __awaiter(this, void 0, void 0, function* () {
        const templateSelects = Object.keys(templates).map((key) => {
            const template = templates[key];
            return `[${key}] ${template.desc}`;
        });
        // select
        const answers = yield inquirer.prompt([
            {
                type: 'list',
                name: 'template',
                message: '选择模版?',
                choices: templateSelects,
            },
        ]);
        // console.info('Answer:', answers.template);
        const keyMatch = answers.template.match(/^\[(\S+)\]/);
        if (keyMatch) {
            const key = keyMatch[1];
            const template = templates[key];
            console.info(template);
            yield fs.mkdir(cacheDir);
            const { url } = template;
            return url;
            //检查控制台是否以运行`git `开头的命令
        }
        else {
            console.error('代码运行错误，获取模版 key 错误');
            process.exit(1);
        }
    });
}
