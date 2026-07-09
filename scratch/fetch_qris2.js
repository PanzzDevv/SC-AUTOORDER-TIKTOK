const fs = require('fs');

async function download() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/yusuf-yaly/qris/main/qris.png');
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync('assets/qris_logo.png', buffer);
      console.log('Downloaded!', buffer.length);
    } else {
      console.log('Failed:', res.status, res.statusText);
    }
  } catch (e) {
    console.log('Error', e);
  }
}

download();
