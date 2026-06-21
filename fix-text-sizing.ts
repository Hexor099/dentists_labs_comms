import fs from 'fs';
import path from 'path';

const dirsToProcess = [
  path.join(process.cwd(), 'src', 'components'),
  path.join(process.cwd(), 'src')
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Let's replace "uppercase tracking-wider", "uppercase tracking-widest", etc.
  content = content.replace(/uppercase tracking-wider/g, 'font-medium');
  content = content.replace(/tracking-wider uppercase/g, 'font-medium');
  content = content.replace(/uppercase tracking-widest/g, 'font-medium');
  content = content.replace(/uppercase font-sans tracking-wider/g, 'font-medium');
  content = content.replace(/font-extrabold uppercase/g, 'font-semibold');
  content = content.replace(/uppercase font-bold tracking-wider/g, 'font-semibold');
  
  // A few more terminal styles to remove
  content = content.replace(/text-\[8\.5px\]/g, 'text-xs');
  content = content.replace(/text-\[9px\]/g, 'text-sm');
  content = content.replace(/text-\[9\.5px\]/g, 'text-sm');
  content = content.replace(/text-\[10px\]/g, 'text-sm');
  content = content.replace(/text-\[10\.5px\]/g, 'text-sm');
  content = content.replace(/text-\[11px\]/g, 'text-sm');
  content = content.replace(/text-\[11\.5px\]/g, 'text-sm');
  
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
