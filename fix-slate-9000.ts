import fs from 'fs';

const files = [
  'src/components/LabAdminDashboardView.tsx',
  'src/components/AiAssistant.tsx',
  'src/components/NotificationsView.tsx',
  'src/components/CasesView.tsx',
  'src/components/InvoicesView.tsx',
  'src/components/UploadsView.tsx',
  'src/components/ChatView.tsx',
  'src/App.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/text-slate-9000/g, 'text-slate-500');
  content = content.replace(/:text-slate-600/g, 'dark:text-slate-600');
  fs.writeFileSync(file, content, 'utf8');
}
