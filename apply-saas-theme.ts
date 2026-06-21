import fs from 'fs';
import path from 'path';

const dirsToProcess = [
  path.join(process.cwd(), 'src', 'components'),
  path.join(process.cwd(), 'src')
];

const patterns = [
  { search: /bg-slate-800|bg-slate-850|bg-slate-900|bg-slate-950|bg-slate-955|bg-\[\#0a0f1d\]|bg-\[\#0b1120\]/g, replace: 'bg-white' },
  { search: /bg-slate-700|bg-slate-600/g, replace: 'bg-slate-50' },
  { search: /border-slate-700|border-slate-800|border-slate-850|border-slate-855|border-slate-900/g, replace: 'border-slate-200' },
  { search: /text-slate-400|text-slate-350|text-slate-300|text-slate-250|text-slate-200|text-slate-100/g, replace: 'text-slate-600' },
  { search: /text-slate-50/g, replace: 'text-slate-900' },
  { search: /text-white|text-slate-105/g, replace: 'text-white' },
  { search: /bg-indigo-900|bg-indigo-950|bg-blue-900|bg-blue-950|bg-sky-900|bg-sky-950|bg-cyan-900|bg-cyan-950|bg-violet-900|bg-violet-950/g, replace: 'bg-blue-50' },
  { search: /text-cyan-400|text-cyan-500|text-indigo-400|text-indigo-500|text-blue-400/g, replace: 'text-blue-600' },
  { search: /text-indigo-600|text-indigo-650/g, replace: 'text-blue-600' },
  { search: /border-cyan-500|border-indigo-500|border-blue-500|border-indigo-500\/20|border-indigo-500\/50|border-indigo-400\/10/g, replace: 'border-blue-200' },
  { search: /bg-indigo-500|bg-indigo-600|bg-indigo-650/g, replace: 'bg-blue-600' },
  { search: /shadow-md|shadow-lg|shadow-xl|shadow-2xl/g, replace: 'shadow-sm' },
  { search: /backdrop-blur-xs|backdrop-blur-sm|backdrop-blur-md/g, replace: '' },
  { search: /bg-white\/[0-9]+/g, replace: 'bg-white' },
  { search: /bg-black\/[0-9]+/g, replace: 'bg-slate-900/50' },
  { search: /bg-slate-9[0-9]0\/[0-9]+/g, replace: 'bg-slate-900/50' },
  
  // Terminal aesthetics
  { search: /font-mono/g, replace: 'font-sans' },
  { search: /uppercase tracking-widest/g, replace: 'font-medium' },
  { search: /uppercase tracking-wider/g, replace: 'font-medium text-sm' },

  // Background app modifications
  { search: /bg-\[\#0a0f1d\]/g, replace: 'bg-slate-50' },
  { search: /bg-slate-900|bg-slate-950/g, replace: 'bg-white' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { search, replace } of patterns) {
    content = content.replace(search, replace);
  }

  // clean up extra spaces
  content = content.replace(/ className=" +/g, ' className="').replace(/  +/g, ' ');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'components') continue; // only process components dir deeper
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

processDirectory(dirsToProcess[1]); // src and src/components
