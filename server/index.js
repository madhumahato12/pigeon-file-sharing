const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const mime = require('mime-types');

const cors = require('cors');
app.use(cors());

const uploadPath = path.join(__dirname, 'upload');
const META_FILE = path.join(__dirname, 'fileMeta.json');

// Ensure upload directory exists
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}
// Load metadata or initialize
let fileMeta = {};
if (fs.existsSync(META_FILE)) {
  try {
    fileMeta = JSON.parse(fs.readFileSync(META_FILE));
  } catch (err) {
    fileMeta = {};
  }
}

const storage = multer.diskStorage({
  destination: uploadPath,
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  }
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, '../client')));// changes public to client// need add in github morning
app.use(express.json());

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const filename = req.file.filename;
//   const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
const expiresAt = Date.now() + 60 * 1000; // expires in 1 minute

  fileMeta[filename] = { path: req.file.path, expiresAt };
  fs.writeFileSync(META_FILE, JSON.stringify(fileMeta));
  const host = req.get('host');
const protocol = req.protocol;
res.json({ link: `${protocol}://${host}/file/${filename}` });

});

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
  res.setHeader('Content-Disposition', 'inline'); 

  res.sendFile(filePath);
});


// Clean up expired files periodically
setInterval(() => {
  const now = Date.now();
  for (const [filename, meta] of Object.entries(fileMeta)) {
    if (now > meta.expiresAt) {
      fs.unlink(meta.path, () => {});
      delete fileMeta[filename];
    }
  }
  fs.writeFileSync(META_FILE, JSON.stringify(fileMeta));
}, 60 * 60 * 1000); // Run every hour

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
