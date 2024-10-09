import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  let safePath = path.normalize(path.join(__dirname, pathname)).replace(/^(\.\.[\/\\])+/, '');

  fs.stat(safePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
        return;
      }
      res.statusCode = 500;
      res.end(`Error getting the file: ${err}.`);
      return;
    }

    if (stats.isDirectory()) {
      if (req.url.endsWith('?download')) {
        // Create a zip file of the directory contents
        const zip = new AdmZip();
        const zipFileName = path.basename(safePath) + '.zip';

        zip.addLocalFolder(safePath);
        const zipBuffer = zip.toBuffer();

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
        res.end(zipBuffer);
      } else {
        fs.readdir(safePath, (err, files) => {
          if (err) {
            res.statusCode = 500;
            res.end(`Error reading directory: ${err}.`);
            return;
          }
          res.setHeader('Content-Type', 'text/html');
          res.write('<html><body><ul>');
          res.write(`<h1>Directory: ${pathname}</h1>`);
          res.write('<li><a href="..">..</a></li>');
          files.forEach(file => {
            const filePath = path.join(pathname, file);
            res.write(`<li><a href="${filePath}">${file}</a></li>`);
          });
          res.write(`<br><a href="${pathname}?download">Download this directory as ZIP</a>`);
          res.end('</ul></body></html>');
        });
      }
      return;
    }

    fs.readFile(safePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(`Error reading file: ${err}.`);
        return;
      }
      const ext = path.extname(safePath).toLowerCase();
      const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.zip': 'application/zip',
        '.doc': 'application/msword',
        '.eot': 'application/vnd.ms-fontobject',
        '.ttf': 'application/x-font-ttf',
      }[ext] || 'text/plain';

      res.setHeader('Content-Type', contentType);
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`File server running at http://localhost:${port}/`);
});