import fs from 'fs';
import path from 'path';

const dirsToProcess = [
  path.join(process.cwd(), 'src', 'components'),
  path.join(process.cwd(), 'src')
];

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/bg-\[\#f8fafc\]/ig, 'bg-slate-50 dark:bg-slate-800');
  content = content.replace(/bg-\[\#fafafa\]/ig, 'bg-slate-50 dark:bg-slate-800');
  content = content.replace(/text-\[\#1E40AF\]/ig, 'text-blue-800 dark:text-blue-300');
  content = content.replace(/bg-\[\#EFF6FF\]/ig, 'bg-blue-50 dark:bg-blue-900/30');
  content = content.replace(/text-\[\#92400E\]/ig, 'text-orange-800 dark:text-orange-300');
  content = content.replace(/bg-\[\#FFFBEB\]/ig, 'bg-orange-50 dark:bg-orange-900/30');
  content = content.replace(/text-\[\#065F46\]/ig, 'text-green-800 dark:text-green-300');
  content = content.replace(/bg-\[\#ECFDF5\]/ig, 'bg-green-50 dark:bg-green-900/30');
  content = content.replace(/text-\[\#2563EB\]/ig, 'text-blue-600 dark:text-blue-400');
  content = content.replace(/bg-\[\#E0F2FE\]/ig, 'bg-slate-100 dark:bg-blue-800/30');
  content = content.replace(/border-\[\#BFDBFE\]/ig, 'border-blue-200 dark:border-blue-700');
  content = content.replace(/border-\[\#FDE68A\]/ig, 'border-orange-200 dark:border-orange-700/50');
  content = content.replace(/border-\[\#A7F3D0\]/ig, 'border-green-200 dark:border-green-700/50');
  content = content.replace(/text-\[\#52525b\]/ig, 'text-slate-600 dark:text-slate-400');
  content = content.replace(/bg-\[\#3b82f6\]/ig, 'bg-blue-500 dark:bg-blue-600');
  content = content.replace(/bg-\[\#fff7ed\]/ig, 'bg-orange-50 dark:bg-orange-900/20');
  content = content.replace(/bg-blue-650/ig, 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600');
  content = content.replace(/text-blue-650/ig, 'text-blue-600 dark:text-blue-400');

  // Any remaining double darks from previous executions
  content = content.replace(/ dark:bg-slate-800 dark:bg-slate-800/g, ' dark:bg-slate-800');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function processDirectory(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'components') continue; 
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

processDirectory(dirsToProcess[1]);
