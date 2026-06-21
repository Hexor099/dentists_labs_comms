import fs from 'fs';
const p = 'src/components/DeliveriesView.tsx';
let content = fs.readFileSync(p, 'utf8');
content = content.replace(/font-extrabold tracking-widest uppercase/g, 'font-semibold text-sm');
fs.writeFileSync(p, content, 'utf8');
