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

    // ✅ Check response
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();

    // ✅ Show secret link
    link.href = data.link;
    link.textContent = data.link;
    result.classList.remove('hidden');

    // ✅ Generate QR code
    qrcodeContainer.innerHTML = '';
    new QRCode(qrcodeContainer, {
      text: data.link,
      width: 200,
      height: 200,
    });

    // ✅ Auto-download the file
    const downloadLink = document.createElement('a');
    downloadLink.href = data.link;
    downloadLink.download = file.name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // ✅ Determine file type and show short info (not preview)
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      preview.innerHTML = `
        <p>PDF file uploaded successfully. Use the link or QR code to download.</p>
      `;
    } else if (fileName.endsWith('.docx')) {
      preview.innerHTML = `
        <p>Word document uploaded successfully.</p>
        <a href="${data.link}" target="_blank" class="btn">Open DOCX</a>
      `;
    } else if (fileName.endsWith('.pptx')) {
      preview.innerHTML = `
        <p>PowerPoint file uploaded successfully.</p>
        <a href="${data.link}" target="_blank" class="btn">Open PPTX</a>
      `;
    } else if (fileName.endsWith('.xlsx')) {
      preview.innerHTML = `
        <p>Excel file uploaded successfully.</p>
        <a href="${data.link}" target="_blank" class="btn">Open XLSX</a>
      `;
    } else {
      preview.innerHTML = `
        <p>File uploaded successfully. (Unknown file type)</p>
      `;
    }

  } catch (err) {
    alert('Upload failed.');
    console.error('Upload failed:', err.message || err);
  }
});
