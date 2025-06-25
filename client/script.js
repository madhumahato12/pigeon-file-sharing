const form = document.getElementById('uploadForm');
const result = document.getElementById('result');
const link = document.getElementById('link');
const qrcodeContainer = document.getElementById('qrcode');
const preview = document.getElementById('preview');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = document.getElementById('fileInput')?.files?.[0];
  if (!file) {
    alert('Please select a file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('https://pigeon-back.onrender.com/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload error: ${res.status} • ${text}`);
    }

    const data = await res.json();

    console.log('Server returned link:', data.link);

    link.href = data.link;
    link.textContent = data.link;
    result.classList.remove('hidden');

    qrcodeContainer.innerHTML = '';
    new QRCode(qrcodeContainer, { text: data.link, width: 200, height: 200 });

    const downloadLink = document.createElement('a');
    downloadLink.href = data.link;
    downloadLink.download = file.name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    const fname = file.name.toLowerCase();
    if (fname.endsWith('.pdf')) preview.textContent = 'PDF uploaded.';
    else if (fname.endsWith('.docx')) preview.textContent = 'DOCX uploaded.';
    else if (fname.endsWith('.pptx')) preview.textContent = 'PPTX uploaded.';
    else if (fname.endsWith('.xlsx')) preview.textContent = 'XLSX uploaded.';
    else preview.textContent = 'File uploaded.';

  } catch (err) {
    alert('Upload failed: ' + err.message);
    console.error('Upload error detail:', err);
  }
});
