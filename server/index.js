// const express = require('express');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');
// const crypto = require('crypto');

// const app = express();
// const PORT = 3000;
// const UPLOAD_DIR = path.join(__dirname, 'uploads');
// const META_FILE = path.join(__dirname, 'fileMeta.json');

// app.use(express.static(path.join(__dirname, '../client')));
// app.use(express.json());

// // Ensure uploads directory exists
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
// if (!fs.existsSync(META_FILE)) fs.writeFileSync(META_FILE, '{}');

// // Load file metadata
// let fileMeta = JSON.parse(fs.readFileSync(META_FILE));

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, UPLOAD_DIR),
//   filename: (req, file, cb) => {
//     const uniqueName = crypto.randomBytes(8).toString('hex') + path.extname(file.originalname);
//     cb(null, uniqueName);
//   },
// });
// const upload = multer({ storage });

// // Upload endpoint
// app.post('/upload', upload.single('file'), (req, res) => {
//   const file = req.file;
//   if (!file) return res.status(400).json({ error: 'No file uploaded' });

//   const id = crypto.randomBytes(8).toString('hex');
//   const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

//   fileMeta[id] = {
//     filename: file.filename,
//     expiresAt,
//   };

//   fs.writeFileSync(META_FILE, JSON.stringify(fileMeta));

//   res.json({ link: `${req.protocol}://${req.get('host')}/download/${id}` });
// });

// // Download endpoint
// app.get('/download/:id', (req, res) => {
//   const id = req.params.id;
//   const meta = fileMeta[id];

//   if (!meta) return res.status(404).send('File not found or expired.');

//   const filePath = path.join(UPLOAD_DIR, meta.filename);
//   if (!fs.existsSync(filePath)) return res.status(404).send('File not found.');

//   res.download(filePath, () => {
//     fs.unlinkSync(filePath);
//     delete fileMeta[id];
//     fs.writeFileSync(META_FILE, JSON.stringify(fileMeta));
//   });
// });

// // Cleanup expired files every hour
// setInterval(() => {
//   const now = Date.now();
//   for (const id in fileMeta) {
//     if (fileMeta[id].expiresAt < now) {
//       const filePath = path.join(UPLOAD_DIR, fileMeta[id].filename);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//       delete fileMeta[id];
//     }
//   }
//   fs.writeFileSync(META_FILE, JSON.stringify(fileMeta));
// }, 60 * 60 * 1000);

// app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));





const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const META_FILE = path.join(__dirname, 'fileMeta.json');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

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
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  }
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const filename = req.file.filename;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  fileMeta[filename] = { path: req.file.path, expiresAt };
  fs.writeFileSync(META_FILE, JSON.stringify(fileMeta));
  res.json({ link: `http://localhost:${PORT}/file/${filename}` });
});

// Download endpoint
app.get('/file/:filename', (req, res) => {
  const { filename } = req.params;
  const meta = fileMeta[filename];

  if (!meta) return res.status(404).send('File not found');
  if (Date.now() > meta.expiresAt) {
    // Expired file
    fs.unlinkSync(meta.path);
    delete fileMeta[filename];
    fs.writeFileSync(META_FILE, JSON.stringify(fileMeta));
    return res.status(410).send('Link expired');
  }

  res.download(meta.path);
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
