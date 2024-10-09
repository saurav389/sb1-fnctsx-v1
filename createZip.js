import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const zip = new AdmZip();

function addDirectoryToZip(directory) {
  try {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (file !== 'node_modules' && file !== 'dist' && file !== '.bolt') {
          addDirectoryToZip(filePath);
        }
      } else if (file !== 'package-lock.json') {
        zip.addLocalFile(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

try {
  addDirectoryToZip(path.resolve(__dirname, '.'));
  zip.writeZip('project.zip');
  console.log('Project has been successfully zipped to project.zip');
} catch (error) {
  console.error('Error creating zip file:', error);
  process.exit(1);
}