const fs = require('fs');
const { createCanvas } = require('canvas');

const canvas = createCanvas(160, 46);
const ctx = canvas.getContext('2d');

// red bg
ctx.fillStyle = '#ed212d';
ctx.fillRect(0,0,80,46);

// blue bg
ctx.fillStyle = '#00376d';
ctx.fillRect(80,0,80,46);

// text
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// "QR" (Italic Arial)
ctx.font = 'italic bold 28px "Arial"';
ctx.fillText('QR', 40, 25);

// "IS" (Normal Arial)
ctx.font = 'bold 28px "Arial"';
ctx.fillText('IS', 120, 25);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('assets/qris_logo.png', buffer);
console.log('Saved canvas-generated QRIS logo!');
