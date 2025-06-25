const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mime = require('mime-types');

const app = express();
const PORT = 3000;

const uploadPath = path.join(__dirname, 'upload');
const META_FILE = path.join(__dirname, 'fileMeta.json');

app.use(cors());
app.use(express.json());

// Ensure upload folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Load or initialize metadata
let fileMeta = {};
if (fs.existsSync(META_FILE)) {
  try {
    fileMeta = JSON.parse(fs.readFileSync(META_FILE));
  } catch {
    fileMeta = {};
  }
}

// Configure multer
const storage = multer.diskStorage({
  destination: uploadPath,
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOCX, and PPTX files are allowed.'));
  }
});

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
  const filename = req.file.filename;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h

  fileMeta[filename] = { path: req.file.path, expiresAt };
  fs.writeFileSync(META_FILE, JSON.stringify(fileMeta));

  const host = req.get('host');
  const protocol = req.protocol;
  res.json({ link: `${protocol}://${host}/file/${filename}` });
});

// Serve uploaded files
app.get('/file/:filename', (req, res) => {
  const { filename } = req.params;
  const meta = fileMeta[filename];
  if (!meta) return res.status(404).send('File not found');

  if (Date.now() > meta.expiresAt) {
    fs.unlinkSync(meta.path);
    delete fileMeta[filename];
    fs.writeFileSync(META_FILE, JSON.stringify(fileMeta));
    return res.status(410).send('Link expired');
  }

  const filePath = path.resolve(meta.path);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(filePath);
});

// Cleanup expired files
setInterval(() => {
  const now = Date.now();
  for (const [filename, meta] of Object.entries(fileMeta)) {
    if (now > meta.expiresAt) {
      fs.unlink(meta.path, () => {});
      delete fileMeta[filename];
    }
  }
  fs.writeFileSync(META_FILE, JSON.stringify(fileMeta));
}, 60 * 60 * 1000);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
