import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'src/components');

function removeDarkClasses(filePath: string) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  // Regex to match "dark:..." classes
  const newContent = fileContent.replace(/dark:[a-zA-Z0-9.\-\/\]\[]+/g, '');
  // Clean up any double spaces or leading/trailing spaces in className strings that might be left
  const cleanedContent = newContent.replace(/ className=" +/g, ' className="').replace(/  +/g, ' ');
  fs.writeFileSync(filePath, cleanedContent, 'utf8');
  console.log(`Processed ${filePath}`);
}

function processDirectory(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      removeDarkClasses(fullPath);
    }
  }
}

processDirectory(componentsDir);
