const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const { bucket } = require('./firebase');
const os = require('os');
const AdmZip = require('adm-zip');

/**
 * Download files from Firebase Storage and ZIP them
 * @param {Array} accounts - array of account objects with storagePath
 * @param {string} orderId - order ID for naming the ZIP
 * @returns {string} local path to the generated ZIP
 */
async function createZipFromAccounts(accounts, orderId) {
  const tempDir = path.join(os.tmpdir(), `panzzstore_${orderId}`);
  const zipPath = path.join(os.tmpdir(), `order_${orderId}.zip`);

  // Create temp directory
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  // Copy and extract each account folder/file from Local Storage
  const downloadPromises = accounts.map(async (acc) => {
    const fileName = acc.fileName || path.basename(acc.storagePath);
    const folderName = fileName.endsWith('.zip') ? fileName.slice(0, -4) : fileName;
    
    // Create a sub-folder for this specific account
    const accountDir = path.join(tempDir, folderName);
    if (!fs.existsSync(accountDir)) fs.mkdirSync(accountDir, { recursive: true });

    // Target extraction path
    const destPath = path.join(accountDir, fileName);
    // Source path from local storage
    const sourcePath = path.join(__dirname, '../storage/', acc.storagePath);

    try {
      if (!fs.existsSync(sourcePath)) {
        throw new Error('Local file not found: ' + sourcePath);
      }
      fs.copyFileSync(sourcePath, destPath);

      // Extract the zip contents into the account folder and delete the zip file itself
      if (fileName.endsWith('.zip')) {
        const zip = new AdmZip(destPath);
        zip.extractAllTo(accountDir, true);
        fs.unlinkSync(destPath);
      }
    } catch (err) {
      console.error(`Failed to process ${acc.storagePath}:`, err.message);
    }
  });

  await Promise.all(downloadPromises);

  // Create ZIP
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    // Use compression level 1 for blazing fast zipping (level 9 is extremely slow)
    const archive = archiver('zip', { zlib: { level: 1 } });

    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();
  });

  // Clean up temp dir
  fs.rmSync(tempDir, { recursive: true, force: true });

  return zipPath;
}

/**
 * Clean up a ZIP file after sending
 */
function cleanupZip(zipPath) {
  try {
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  } catch (e) {
    console.error('Cleanup error:', e.message);
  }
}

module.exports = { createZipFromAccounts, cleanupZip };
