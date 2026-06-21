import fs from 'fs';
import path from 'path';

const dirsToProcess = [
  path.join(process.cwd(), 'src', 'components'),
  path.join(process.cwd(), 'src')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/text-slate-9000/g, 'text-slate-600');
  content = content.replace(/bg-slate-55/g, 'bg-slate-50');
  content = content.replace(/text-slate-650/g, 'text-slate-600');
  // Just catching any remaining dark: text color anomalies
  content = content.replace(/dark:text-[a-zA-Z0-9.-]+/g, '');
  content = content.replace(/dark:bg-[a-zA-Z0-9.-]+/g, '');
  content = content.replace(/dark:border-[a-zA-Z0-9.-]+/g, '');
  content = content.replace(/dark:hover-[a-zA-Z0-9.-]+/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function processDirectory(dirPath) {
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
