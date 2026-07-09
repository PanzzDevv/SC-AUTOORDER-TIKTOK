const https = require('https');
const fs = require('fs');

const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/512px-Logo_QRIS.svg.png';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'image/png,image/*;q=0.8,*/*;q=0.5'
  }
}, (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log('Redirect to:', res.headers.location);
    https.get(res.headers.location, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res2) => {
      const file = fs.createWriteStream('assets/qris_logo.png');
      res2.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Download complete (redirected).');
      });
    });
  } else {
    const file = fs.createWriteStream('assets/qris_logo.png');
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download complete.');
    });
  }
}).on('error', (err) => {
  console.error('Error:', err.message);
});
