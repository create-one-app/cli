import fetch from 'node-fetch';

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

export async function getTemplates() {
  const response = await fetch(
    'https://processor.vercel.app/api/app-templates',
  );
  return response.json();
}

export default templates;
