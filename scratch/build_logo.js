const Jimp = require('jimp');
const fs = require('fs');

async function buildLogo() {
  try {
    console.log('Downloading parts...');
    
    // Fetch red part 'QR'
    const resQR = await fetch('https://placehold.co/80x46/ed212d/ffffff.png?text=QR&font=montserrat');
    const bufQR = Buffer.from(await resQR.arrayBuffer());
    const jimpQR = await Jimp.read(bufQR);

    // Fetch blue part 'IS'
    const resIS = await fetch('https://placehold.co/80x46/00376d/ffffff.png?text=IS&font=montserrat');
    const bufIS = Buffer.from(await resIS.arrayBuffer());
    const jimpIS = await Jimp.read(bufIS);

    // Create a blank 160x46 image
    const logo = new Jimp(160, 46);
    
    // Composite
    logo.composite(jimpQR, 0, 0);
    logo.composite(jimpIS, 80, 0);

    // Save
    await logo.writeAsync('assets/qris_logo.png');
    console.log('Successfully built custom QRIS logo via placehold.co!');
    
  } catch(e) {
    console.error('Error:', e);
  }
}

buildLogo();
