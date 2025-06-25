const form = document.getElementById('uploadForm');
const result = document.getElementById('result');
const link = document.getElementById('link');
const qrcodeContainer = document.getElementById('qrcode');
const preview = document.getElementById('preview');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = document.getElementById('fileInput')?.files?.[0];
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

    // Generate QR code
    qrcodeContainer.innerHTML = '';
    new QRCode(qrcodeContainer, {
      text: data.link,
      width: 200,
      height: 200,
    });

    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // Auto-download file
    const downloadLink = document.createElement('a');
    downloadLink.href = data.link;
    downloadLink.download = file.name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Show preview
    if (fileType === 'application/pdf') {
      preview.innerHTML = `
        <h3>PDF Preview:</h3>
        <iframe src="${data.link}" width="100%" height="500px" style="border:1px solid #ccc;"></iframe>
      `;
    } else if (fileName.endsWith('.docx')) {
      preview.innerHTML = `
        <h3>DOCX Uploaded</h3>
        <p>Preview not supported in browser. You can open it using Word or Google Docs.</p>
        <a href="${data.link}" target="_blank" class="btn">Open DOCX</a>
      `;
    } else if (fileName.endsWith('.pptx')) {
      preview.innerHTML = `
        <h3>PPTX Uploaded</h3>
        <p>Preview not supported in browser. You can open it using PowerPoint or Google Slides.</p>
        <a href="${data.link}" target="_blank" class="btn">Open PPTX</a>
      `;
    } else {
      preview.innerHTML = `<p>Unsupported file type.</p>`;
    }

  } catch (err) {
    alert('Upload failed.');
    console.error(err);
  }
});
