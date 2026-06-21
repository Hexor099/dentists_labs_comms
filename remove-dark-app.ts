import fs from 'fs';
import path from 'path';

const appFile = path.join(process.cwd(), 'src/App.tsx');
let content = fs.readFileSync(appFile, 'utf8');
content = content.replace(/dark:[a-zA-Z0-9.\-\/\]\[]+/g, '');
content = content.replace(/ className=" +/g, ' className="').replace(/  +/g, ' ');
fs.writeFileSync(appFile, content, 'utf8');
console.log('Processed App.tsx');
