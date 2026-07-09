const Jimp = require('jimp');
const qrcode = require('qrcode');
const path = require('path');

async function createTemplateV2() {
  const width = 600;
  const height = 850;

  const image = new Jimp(width, height);
  
  // 1. Premium Gradient Background
  for (let y = 0; y < height; y++) {
    const ratio = y / height;
    const r = Math.round(15 * (1 - ratio) + 10 * ratio);
    const g = Math.round(30 * (1 - ratio) + 15 * ratio);
    const b = Math.round(70 * (1 - ratio) + 30 * ratio);
    const color = Jimp.rgbaToInt(r, g, b, 255);
    for (let x = 0; x < width; x++) {
      image.setPixelColor(color, x, y);
    }
  }

  // Soft glow around center
  const cx = width / 2;
  const cy = height / 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
      if (dist < 400) {
        const existing = Jimp.intToRGBA(image.getPixelColor(x, y));
        const alpha = Math.max(0, 15 - dist * (15/400));
        const r = Math.min(255, existing.r + alpha);
        const g = Math.min(255, existing.g + alpha * 2);
        const b = Math.min(255, existing.b + alpha * 3);
        image.setPixelColor(Jimp.rgbaToInt(r, g, b, 255), x, y);
      }
    }
  }

  const boxSize = 460;
  const boxX = (width - boxSize) / 2;
  const boxY = (height - boxSize) / 2 + 30;
  const radius = 25;

  // Helper function to draw rounded rect
  const drawRoundRect = (img, cX, cY, cSize, cRadius, color, startY = 0) => {
    for (let y = startY; y < cSize; y++) {
      for (let x = 0; x < cSize; x++) {
        let isInside = true;
        if (x < cRadius && y < cRadius) {
          isInside = Math.pow(x - cRadius, 2) + Math.pow(y - cRadius, 2) <= cRadius * cRadius;
        } else if (x > cSize - cRadius && y < cRadius) {
          isInside = Math.pow(x - (cSize - cRadius), 2) + Math.pow(y - cRadius, 2) <= cRadius * cRadius;
        } else if (x < cRadius && y > cSize - cRadius) {
          isInside = Math.pow(x - cRadius, 2) + Math.pow(y - (cSize - cRadius), 2) <= cRadius * cRadius;
        } else if (x > cSize - cRadius && y > cSize - cRadius) {
          isInside = Math.pow(x - (cSize - cRadius), 2) + Math.pow(y - (cSize - cRadius), 2) <= cRadius * cRadius;
        }
        if (isInside) {
          // If color has alpha, we need to blend
          const rgba = Jimp.intToRGBA(color);
          if (rgba.a < 255) {
            const bg = Jimp.intToRGBA(img.getPixelColor(cX + x, cY + y));
            const mixedR = Math.round((rgba.r * rgba.a + bg.r * (255 - rgba.a)) / 255);
            const mixedG = Math.round((rgba.g * rgba.a + bg.g * (255 - rgba.a)) / 255);
            const mixedB = Math.round((rgba.b * rgba.a + bg.b * (255 - rgba.a)) / 255);
            img.setPixelColor(Jimp.rgbaToInt(mixedR, mixedG, mixedB, 255), cX + x, cY + y);
          } else {
            img.setPixelColor(color, cX + x, cY + y);
          }
        }
      }
    }
  };

  // 2. Draw Shadow (Black with opacity)
  drawRoundRect(image, boxX + 15, boxY + 25, boxSize, radius, Jimp.rgbaToInt(0, 0, 0, 60));
  drawRoundRect(image, boxX + 5, boxY + 10, boxSize, radius, Jimp.rgbaToInt(0, 0, 0, 100));

  // 3. Draw White Box
  drawRoundRect(image, boxX, boxY, boxSize, radius, Jimp.rgbaToInt(255, 255, 255, 255));

  // 4. Official QRIS Logo
  const logoW = 160;
  const logoX = (width - logoW) / 2;
  const logoY = boxY - 30; // Overlapping the box slightly
  
  // Shadow for logo
  drawRoundRect(image, logoX + 5, logoY + 5, logoW, 10, Jimp.rgbaToInt(0, 0, 0, 80), 0);
  
  // Load real logo
  const realLogoPath = path.join(__dirname, '../assets/qris_logo.png');
  const qrisLogo = await Jimp.read(realLogoPath);
  qrisLogo.resize(logoW, Jimp.AUTO); // Auto height to maintain aspect ratio
  
  image.composite(qrisLogo, logoX, logoY);

  const fontBig = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  const fontMed = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

  // 5. Generate and composite QR Code
  const dummyQrString = "00020101021226590012ID.CO.SHOPEE...";
  const qrBuffer = await qrcode.toBuffer(dummyQrString, {
    margin: 2,
    width: 400,
    color: { dark: '#000000', light: '#ffffff' }
  });
  const qrImage = await Jimp.read(qrBuffer);
  image.composite(qrImage, boxX + (boxSize - qrImage.getWidth()) / 2, boxY + (boxSize - qrImage.getHeight()) / 2 + 15);

  // 6. Texts
  const storeName = "PanzzStore";
  image.print(
    fontBig,
    0,
    65,
    { text: storeName, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
    width
  );

  image.print(
    fontMed,
    0,
    boxY + boxSize + 30,
    { text: "SCAN UNTUK MEMBAYAR", alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
    width
  );

  image.print(
    fontSmall,
    0,
    height - 40,
    { text: "Verifikasi Pembayaran Otomatis", alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
    width
  );

  const outputPath = path.join(__dirname, 'qris_template_v2.png');
  await image.writeAsync(outputPath);
  console.log('Preview saved to:', outputPath);
}

createTemplateV2().catch(console.error);
