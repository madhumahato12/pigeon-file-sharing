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
    link.href = data.link;
    link.textContent = data.link;
    result.classList.remove('hidden');

    // Show QR code
    qrcodeContainer.innerHTML = '';
    new QRCode(qrcodeContainer, {
      text: data.link,
      width: 200,
      height: 200,
    });

    // Show file preview (only for PDF)
    if (file.type === 'application/pdf') {
      preview.innerHTML = `
        <h3>Preview:</h3>
        <iframe src="${data.link}" width="100%" height="500px" style="border:1px solid #ccc;"></iframe>
      `;
    } else {
      preview.innerHTML = `<p>Preview not available for this file type.</p>`;
    }

  } catch (err) {
    alert('Upload failed.');
  }
});
