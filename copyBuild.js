import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.join(__dirname, 'dist', 'index.html');
const destPath = path.join(__dirname, 'project-management-app.html');

fs.copyFile(sourcePath, destPath, (err) => {
  if (err) throw err;
  console.log('Build file copied to root directory as project-management-app.html');
});