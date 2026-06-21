import fs from 'fs';

const replaces = [
  { p: 'src/components/SystemsExplorerView.tsx', from: /blue-650/g, to: 'blue-700' },
  { p: 'src/components/TechnicianDashboardView.tsx', from: /border-slate-205/g, to: 'border-slate-200' },
  { p: 'src/components/ChatView.tsx', from: /border-slate-250/g, to: 'border-slate-200' },
  { p: 'src/components/ChatView.tsx', from: /border-indigo-550/g, to: 'border-blue-500' },
];

for (const { p, from, to } of replaces) {
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(from, to);
  fs.writeFileSync(p, content, 'utf8');
}
