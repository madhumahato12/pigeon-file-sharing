const form = document.getElementById('uploadForm');
const result = document.getElementById('result');
const link = document.getElementById('link');
const qrcodeContainer = document.getElementById('qrcode');
const preview = document.getElementById('preview');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('fileInput');
  const file = fileInput?.files?.[0];

  if (!file) {
    alert('Please select a file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('https://pigeon-back.onrender.com/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload error: ${res.status} • ${text}`);
    }

    const data = await res.json();

    if (!data.link) {
      throw new Error('No link returned from server.');
    }

    // Update link
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

    // Optional: Automatically trigger download
    // Comment this out if you want users to click manually
    const downloadLink = document.createElement('a');
    downloadLink.href = data.link;
    downloadLink.download = file.name;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // File preview message
    const fname = file.name.toLowerCase();
    if (fname.endsWith('.pdf')) preview.textContent = 'PDF file uploaded.';
    else if (fname.endsWith('.docx')) preview.textContent = 'Word file uploaded.';
    else if (fname.endsWith('.pptx')) preview.textContent = 'PowerPoint file uploaded.';
    else if (fname.endsWith('.xlsx')) preview.textContent = 'Excel file uploaded.';
    else preview.textContent = 'File uploaded successfully.';

  } catch (err) {
    alert('Upload failed: ' + err.message);
    console.error('Upload error detail:', err);
  } finally {
    form.reset(); // clear the form after upload
  }
});




