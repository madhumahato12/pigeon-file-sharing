const form = document.getElementById('uploadForm');
const result = document.getElementById('result');
const link = document.getElementById('link');
const qrcodeContainer = document.getElementById('qrcode');
const preview = document.getElementById('preview');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = document.getElementById('fileInput')?.files?.[0] || document.getElementById('upload')?.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('https://pigeon-back.onrender.com/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    // Show secret link
    link.href = data.link;
    link.textContent = data.link;
    result.classList.remove('hidden');

    // Generate QR Code
    qrcodeContainer.innerHTML = '';
    new QRCode(qrcodeContainer, {
      text: data.link,
      width: 200,
      height: 200,
    });

    // Show file preview
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf') {
      preview.innerHTML = `
        <h3>PDF Preview:</h3>
        <iframe src="${data.link}" width="100%" height="500px" style="border:1px solid #ccc;"></iframe>
      `;
    } else if (fileName.endsWith('.docx')) {
      preview.innerHTML = `
        <h3>DOCX File Uploaded:</h3>
        <p>Preview not available. Click below to open or download the file:</p>
        <a href="${data.link}" target="_blank" class="btn">Download DOCX</a>
      `;
    } else {
      preview.innerHTML = `
        <p>Unsupported file type.</p>
      `;
    }

  } catch (err) {
    alert('Upload failed.');
    console.error(err);
  }
});

