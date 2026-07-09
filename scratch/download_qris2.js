const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'api.github.com',
  path: '/repos/tomybudiman/litecart-qris-payment-module/contents/includes/modules/payment/qris/qris-logo.png',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js Script'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.content && json.encoding === 'base64') {
        const buffer = Buffer.from(json.content, 'base64');
        fs.writeFileSync('assets/qris_logo.png', buffer);
        console.log('Successfully saved qris_logo.png');
      } else {
        console.error('Invalid response format', data);
      }
    } catch (e) {
      console.error('Failed to parse json', e);
    }
  });
}).on('error', (err) => {
  console.error('Request error', err);
});
