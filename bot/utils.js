const { getSession } = require('./sessions');

/** Escape special HTML characters */
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Format number to Rupiah string for HTML */
function formatRupiah(num) {
  return Number(num).toLocaleString('id-ID');
}

/**
 * Edit the main persistent message (photo caption or text) using HTML parse mode.
 */
async function editMain(bot, chatId, text, keyboard, msgId = null) {
  const session = getSession(chatId);
  const targetId = msgId || session.mainMessageId;
  const isPhoto  = session.mainIsPhoto !== false;

  if (!targetId) {
    const m = await bot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
    session.mainMessageId = m.message_id;
    session.mainIsPhoto = false;
    return;
  }

  try {
    if (isPhoto) {
      await bot.editMessageCaption(text, {
        chat_id: chatId,
        message_id: targetId,
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
    } else {
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: targetId,
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
    }
  } catch (e) {
    console.error('editMain HTML error:', e.message);
    try {
      const m = await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
      session.mainMessageId = m.message_id;
      session.mainIsPhoto = false;
    } catch {}
  }
}

const axios = require('axios');
const qrcode = require('qrcode');

/**
 * Generate a QRIS image buffer using Pakasir API
 */
async function generateQris(amount, orderId) {
  try {
    const res = await axios.post('https://app.pakasir.com/api/transactioncreate/qris', {
      project: process.env.PAKASIR_SLUG,
      order_id: orderId,
      amount: amount,
      api_key: process.env.PAKASIR_API_KEY
    });
    
    // Extract the QR string from the response
    const qrString = res.data?.payment?.payment_number;
    
    if (!qrString) {
      console.error('No QR String in response:', res.data);
      throw new Error('QR string not found in Pakasir response');
    }
    
    // Generate an image buffer from the QR string
    const qrBuffer = await qrcode.toBuffer(qrString, { 
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 500,
      color: { dark: '#A855F7', light: '#ffffff' } // Custom purple styling
    });
    
    return qrBuffer;
  } catch (err) {
    console.error('Failed to generate QRIS:', err.response?.data || err.message);
    return null;
  }
}

module.exports = { escapeHTML, formatRupiah, editMain, generateQris };
