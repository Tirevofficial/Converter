let uploadedBlob = null;

document.getElementById('upload').addEventListener('change', async function (e) {
  const file = e.target.files[0];
  if (!file) return;

  let fixedFile = file;

  // If the file looks weird or lacks a known image extension, force it to .heic if MIME type indicates so
  const isUnknown = !file.name.match(/\.(heic|jpg|jpeg|png|webp)$/i);
  if (isUnknown && file.type === 'image/heic') {
    fixedFile = new File([file], 'fixed.heic', { type: 'image/heic' });
  }

  // If HEIC, convert it
  if (fixedFile.type === 'image/heic' || fixedFile.name.toLowerCase().endsWith('.heic')) {
    try {
      const outputBlob = await heic2any({
        blob: fixedFile,
        toType: 'image/jpeg',
      });

      const imgURL = URL.createObjectURL(outputBlob);
      document.getElementById('inputPreview').src = imgURL;
      uploadedBlob = outputBlob;
    } catch (err) {
      alert("HEIC conversion failed. Try a different file or browser.");
      console.error(err);
    }
  } else {
    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById('inputPreview').src = event.target.result;
    };
    reader.readAsDataURL(fixedFile);
    uploadedBlob = fixedFile;
  }
});

function convertImage() {
  const format = document.getElementById('format').value;

  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(function (blob) {
      const link = document.getElementById('downloadLink');
      link.href = URL.createObjectURL(blob);
      link.download = `converted.${format.split('/')[1]}`;
      link.style.display = "inline-block";
    }, format);
  };

  img.src = URL.createObjectURL(uploadedBlob);
}
