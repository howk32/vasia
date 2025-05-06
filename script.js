const gifInput = document.getElementById('gifInput');
const viewer = document.getElementById('viewer');
const gif = document.getElementById('gif');

gifInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'image/gif') {
    const url = URL.createObjectURL(file);
    gif.src = url;
    viewer.classList.remove('hidden');
  }
});

// Click on viewer hides it
gif.addEventListener('click', () => {
  viewer.classList.add('hidden');
  URL.revokeObjectURL(gif.src);
});
