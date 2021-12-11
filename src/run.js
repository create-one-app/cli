"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var cac_1 = require("cac");
var inquirer_1 = require("inquirer");
var shelljs_1 = require("shelljs");
var zx_1 = require("zx");
var templates_1 = require("./templates");
var curWorkDir = process.cwd();
var version = JSON.parse(zx_1.fs.readFileSync(zx_1.path.resolve(curWorkDir, './package.json'), 'utf-8')).version;
// console.log(version);
var cacheDir = zx_1.path.resolve(curWorkDir, './.coa_cache');
var cli = (0, cac_1["default"])('coa');
cli
    .command('new [project]', 'creat new app')
    .option('--url [repository]', 'custom git repository', {
    "default": ''
})
    .action(function (project, options) {
    // console.log('project', project);
    if (!project) {
        console.log('请输入项目名，模版将复制到该目录下');
        process.exit(1);
    }
    var projectDir = zx_1.path.resolve(curWorkDir, "./".concat(project));
    // NOTE: 判断目录是否已存在
    if (zx_1.fs.existsSync(projectDir)) {
        console.log("\u9879\u76EE\uFF1A".concat(project, " \u5DF2\u5B58\u5728\uFF0C\u8BF7\u4FEE\u6539\u9879\u76EE\u540D"));
        process.exit(1);
    }
    var url = options.url;
    if (url) {
        create({ project: project, url: url, projectDir: projectDir });
    }
    else {
        selectTemplate().then(function (url) {
            create({ project: project, url: url, projectDir: projectDir });
        });
    }
});
// Display help message when `-h` or `--help` appears
cli.help();
// Display version number when `-v` or `--version` appears
// It's also used in help message
cli.version(version);
cli.parse();
function create(_a) {
    var project = _a.project, url = _a.url, projectDir = _a.projectDir;
    if (!shelljs_1["default"].which('git')) {
        //在控制台输出内容
        shelljs_1["default"].echo('Sorry, this script requires git');
        shelljs_1["default"].exit(1);
    }
    var projectCache = zx_1.path.resolve(cacheDir, "./".concat(project));
    shelljs_1["default"].exec("git clone ".concat(url, " ").concat(projectCache, " -q"), function (code) {
        if (code !== 0) {
            // console.log('Program output:', stdout);
            // console.log('Program stderr:', stderr);
            process.exit(1);
        }
        else {
            // TODO: copy file
            // console.log('Exit code:', code);
            zx_1.fs.copySync(projectCache, projectDir, {
                filter: function (src) {
                    return !/\.git/.test(src);
                }
            });
            zx_1.fs.removeSync(cacheDir);
            console.log('项目已生成');
        }
    });
}
function selectTemplate() {
    return __awaiter(this, void 0, void 0, function () {
        var templateSelects, answers, keyMatch, key, template, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    templateSelects = Object.keys(templates_1["default"]).map(function (key) {
                        var template = templates_1["default"][key];
                        return "[".concat(key, "] ").concat(template.desc);
                    });
                    return [4 /*yield*/, inquirer_1["default"].prompt([
                            {
                                type: 'list',
                                name: 'template',
                                message: '选择模版?',
                                choices: templateSelects
                            },
                        ])];
                case 1:
                    answers = _a.sent();
                    keyMatch = answers.template.match(/^\[(\S+)\]/);
                    if (!keyMatch) return [3 /*break*/, 3];
                    key = keyMatch[1];
                    template = templates_1["default"][key];
                    console.info(template);
                    return [4 /*yield*/, zx_1.fs.mkdir(cacheDir)];
                case 2:
                    _a.sent();
                    url = template.url;
                    return [2 /*return*/, url];
                case 3:
                    console.error('代码运行错误，获取模版 key 错误');
                    process.exit(1);
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
