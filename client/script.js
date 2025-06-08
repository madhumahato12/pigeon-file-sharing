// const form = document.getElementById('uploadForm');
// const result = document.getElementById('result');
// const link = document.getElementById('link');
// const qrcodeContainer = document.getElementById('qrcode');

// form.addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const file = document.getElementById('fileInput').files[0];
//   if (!file) return;

//   const formData = new FormData();
//   formData.append('file', file);

//   try {
//     const res = await fetch('/upload', { method: 'POST', body: formData });
//     const data = await res.json();
//     link.href = data.link;
//     link.textContent = data.link;
//     result.classList.remove('hidden');

//     // Clear old QR code if any
//     qrcodeContainer.innerHTML = '';

//     // Generate QR code for the link
//     new QRCode(qrcodeContainer, {
//       text: data.link,
//       width: 200,
//       height: 200,
//     });
   

//   } catch (err) {
//     alert('Upload failed.');
//   }
// });




const form = document.getElementById('uploadForm');
const result = document.getElementById('result');
const link = document.getElementById('link');
const qrcodeContainer = document.getElementById('qrcode');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = document.getElementById('fileInput').files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    // const res = await fetch('/upload', { method: 'POST', body: formData });
    const res = await fetch('https://pigeon-back.onrender.com/upload', {
  method: 'POST',
  body: formData
});
    const data = await res.json();
    link.href = data.link;
    link.textContent = data.link;
    result.classList.remove('hidden');

    qrcodeContainer.innerHTML = '';
    new QRCode(qrcodeContainer, {
      text: data.link,
      width: 200,
      height: 200,
    });
  } catch (err) {
    alert('Upload failed.');
  }
});