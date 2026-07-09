const fs = require('fs');

async function download() {
  try {
    const res = await fetch('https://seeklogo.com/images/Q/qris-logo-67E83E8CA1-seeklogo.com.png', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://seeklogo.com/'
      }
    });
    
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
