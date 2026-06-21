import fs from 'fs';
import path from 'path';

const dirsToProcess = [
  path.join(process.cwd(), 'src', 'components'),
  path.join(process.cwd(), 'src')
];

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove existing dark classes to avoid duplication
  content = content.replace(/ dark:bg-[a-zA-Z0-9.-]+/g, '');
  content = content.replace(/ dark:text-[a-zA-Z0-9.-]+/g, '');
  content = content.replace(/ dark:border-[a-zA-Z0-9.-]+/g, '');

  const mappings = [
    { search: /\bbg-white\b/g, replace: 'bg-white dark:bg-slate-900' },
    { search: /\bbg-slate-50\b/g, replace: 'bg-slate-50 dark:bg-slate-800' },
    { search: /\bbg-slate-100\b/g, replace: 'bg-slate-100 dark:bg-slate-800/80' },
    { search: /\bbg-blue-50\b/g, replace: 'bg-blue-50 dark:bg-blue-900/20' },
    { search: /\bbg-blue-600\b/g, replace: 'bg-blue-600 dark:bg-blue-500' },
    { search: /\bbg-indigo-50\b/g, replace: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { search: /\bbg-red-50\b/g, replace: 'bg-red-50 dark:bg-red-900/20' },
    { search: /\bbg-orange-50\b/g, replace: 'bg-orange-50 dark:bg-orange-900/20' },
    
    { search: /\btext-slate-900\b/g, replace: 'text-slate-900 dark:text-slate-50' },
    { search: /\btext-slate-800\b/g, replace: 'text-slate-800 dark:text-slate-200' },
    { search: /\btext-slate-700\b/g, replace: 'text-slate-700 dark:text-slate-300' },
    { search: /\btext-slate-600\b/g, replace: 'text-slate-600 dark:text-slate-300' },
    { search: /\btext-slate-500\b/g, replace: 'text-slate-500 dark:text-slate-400' },
    { search: /\btext-slate-400\b/g, replace: 'text-slate-400 dark:text-slate-500' },
    
    { search: /\btext-blue-800\b/g, replace: 'text-blue-800 dark:text-blue-200' },
    { search: /\btext-blue-700\b/g, replace: 'text-blue-700 dark:text-blue-300' },
    { search: /\btext-blue-600\b/g, replace: 'text-blue-600 dark:text-blue-400' },
    
    { search: /\bborder-slate-100\b/g, replace: 'border-slate-100 dark:border-slate-800' },
    { search: /\bborder-slate-200\b/g, replace: 'border-slate-200 dark:border-slate-700' },
    { search: /\bborder-slate-300\b/g, replace: 'border-slate-300 dark:border-slate-600' },
    { search: /\bborder-blue-200\b/g, replace: 'border-blue-200 dark:border-blue-800' },
  ];

  for (const { search, replace } of mappings) {
    content = content.replace(search, replace);
  }

  // Clean double spaces created safely inside className attributes
  content = content.replace(/ className=" +/g, ' className="').replace(/  +/g, ' ');

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
