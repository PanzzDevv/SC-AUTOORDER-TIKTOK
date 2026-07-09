require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
process.env.NTBA_FIX_350 = '1';
const TelegramBot = require('node-telegram-bot-api');
const { handleStart, handleBackToMenu } = require('./handlers/start');
const {
  handleBeli, handleSelectType, handleSelectGaransi,
  handleQtySelected, handleConfirmOrder, handleTextMessage,
  handlePayWithSaldo,
} = require('./handlers/order');
const { handleSaldo }   = require('./handlers/saldo');
const { handleBantuan } = require('./handlers/bantuan');
const { getSession }    = require('./sessions');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log('🤖 PanzzStore Bot is running...');

// ─── /start ───────────────────────────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  try { await handleStart(bot, msg); }
  catch (e) { console.error('Start error:', e.message); }
});

// ─── TEXT MESSAGES ────────────────────────────────────────────────────────────
bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId  = msg.chat.id;
  const text    = msg.text;
  const session = getSession(chatId);

  // Handle Admin Replies to Help Tickets
  const adminIds = (process.env.ADMIN_TELEGRAM_ID || '').split(',').map(s => s.trim());
  if (adminIds.includes(String(chatId)) && msg.reply_to_message) {
    const { getUserIdFromHelpTicket } = require('../server/firebase');
    const replyToMsgId = msg.reply_to_message.message_id;

    try {
      const targetUserId = await getUserIdFromHelpTicket(replyToMsgId);
      if (targetUserId) {
        const { escapeHTML } = require('./utils');
        const userReplyMsg = `💬 <b>Balasan dari Admin:</b>\n\n` +
          `<blockquote>${escapeHTML(text)}</blockquote>`;
        
        await bot.sendMessage(targetUserId, userReplyMsg, { parse_mode: 'HTML' });
        await bot.sendMessage(chatId, '✅ <b>Balasan berhasil terkirim ke user!</b>', {
          reply_to_message_id: msg.message_id
        });
        return;
      }
    } catch (e) {
      console.error('Error handling admin reply:', e.message);
    }
  }

  // State: Waiting for support message (Kirim Pesan ke Admin)
  if (session.waitingForBantuanMsg) {
    session.waitingForBantuanMsg = false;
    const adminTelegramId = adminIds[0]; // Send to the first configured admin ID
    if (!adminTelegramId) {
      await bot.sendMessage(chatId, '❌ Fitur bantuan lewat bot belum dikonfigurasi oleh admin.');
      return;
    }

    try {
      const { escapeHTML } = require('./utils');
      const { saveHelpTicket } = require('../server/firebase');

      // Send to Admin
      const adminMsg = `📩 <b>PESAN BANTUAN BARU</b>\n\n` +
        `👤 <b>Dari:</b> @${msg.from.username || '—'} (${msg.from.first_name || 'User'}) (ID: <code>${chatId}</code>)\n` +
        `💬 <b>Pesan:</b>\n<blockquote>${escapeHTML(text)}</blockquote>\n\n` +
        `<i>ℹ️ Balas (Reply) pesan ini untuk membalas ke user.</i>`;
      
      const sentMsg = await bot.sendMessage(adminTelegramId, adminMsg, { parse_mode: 'HTML' });
      
      // Save mapping in Firestore
      await saveHelpTicket(sentMsg.message_id, chatId);

      await bot.sendMessage(chatId, '✅ <b>Pesan bantuan berhasil dikirim!</b>\nAdmin akan segera membalas ke chat bot ini. Silakan tunggu.', { parse_mode: 'HTML' });
    } catch (e) {
      console.error('Failed to process help message:', e.message);
      await bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengirim pesan ke admin. Hubungi admin secara manual.');
    }
    return;
  }

  // Reply keyboard: ➤ Cek Saldo
  if (text === '➤ Cek Saldo') {
    bot.deleteMessage(chatId, msg.message_id).catch(() => {});
    try { await handleSaldo(bot, chatId, 'new', msg.from); }
    catch (e) { console.error('Saldo error:', e.message); }
    return;
  }

  // Reply keyboard: ➤ Pusat Bantuan
  if (text === '➤ Pusat Bantuan') {
    bot.deleteMessage(chatId, msg.message_id).catch(() => {});
    try { await handleBantuan(bot, chatId, 'new'); }
    catch (e) { console.error('Bantuan error:', e.message); }
    return;
  }

  // State: Waiting for custom top up amount
  if (session.waitingForTopUpAmt) {
    const amt = parseInt(text.replace(/[^0-9]/g, ''));
    if (isNaN(amt) || amt < 10000) {
      await bot.sendMessage(chatId, '❌ Masukkan nominal angka yang valid (minimal Rp 10.000).', {
        reply_to_message_id: msg.message_id
      });
      return;
    }
    // Delete user's message
    bot.deleteMessage(chatId, msg.message_id).catch(() => {});
    const { handleProcessTopUp } = require('./handlers/saldo');
    try {
      await handleProcessTopUp(bot, chatId, session.mainMessageId, amt, msg.from);
    } catch (e) {
      console.error('Custom top up process error:', e.message);
    }
    return;
  }

  // Qty manual input
  try { await handleTextMessage(bot, msg); }
  catch (e) { console.error('Text handler error:', e.message); }
});

// ─── CALLBACK QUERIES ─────────────────────────────────────────────────────────
bot.on('callback_query', async (query) => {
  const { data, message, from } = query;
  const chatId    = message.chat.id;
  const messageId = message.message_id;

  try { await bot.answerCallbackQuery(query.id); } catch {}

  // Sync session with the current message state to prevent edit errors after bot restarts
  const session = getSession(chatId);
  if (session.mainIsPhoto === undefined && message) {
    session.mainIsPhoto = !!message.photo;
  }
  if (!session.mainMessageId) {
    session.mainMessageId = messageId;
  }

  try {
    switch (true) {
      case data === 'back_menu':
        await handleBackToMenu(bot, chatId, messageId, from.first_name);
        break;
        
      case data === 'close_qris':
        bot.deleteMessage(chatId, messageId).catch(() => {});
        break;

      case data === 'menu_beli':
        await handleBeli(bot, chatId, messageId);
        break;

      case data === 'type_muda':
        await handleSelectType(bot, chatId, messageId, 'muda');
        break;
      case data === 'type_tua':
        await handleSelectType(bot, chatId, messageId, 'tua');
        break;

      case data === 'garansi_yes':
        await handleSelectGaransi(bot, chatId, messageId, true);
        break;
      case data === 'garansi_no':
        await handleSelectGaransi(bot, chatId, messageId, false);
        break;

      // Qty buttons: 10-100 by 10, dan 200
      case data.startsWith('qty_'): {
        const qty = parseInt(data.split('_')[1]);
        await handleQtySelected(bot, chatId, messageId, qty);
        break;
      }

      case data === 'confirm_order':
        await handleConfirmOrder(bot, chatId, messageId, from);
        break;

      case data === 'pay_with_saldo':
        await handlePayWithSaldo(bot, chatId, messageId, from);
        break;

      case data === 'menu_saldo':
        await handleSaldo(bot, chatId, messageId, from);
        break;

      case data === 'saldo_topup': {
        const { handleTopUpMenu } = require('./handlers/saldo');
        await handleTopUpMenu(bot, chatId, messageId);
        break;
      }

      case data === 'topup_custom': {
        const { handleTopUpCustom } = require('./handlers/saldo');
        await handleTopUpCustom(bot, chatId, messageId);
        break;
      }

      case data.startsWith('topup_amt_'): {
        const amt = parseInt(data.split('_')[2]);
        const { handleProcessTopUp } = require('./handlers/saldo');
        await handleProcessTopUp(bot, chatId, messageId, amt, from);
        break;
      }

      case data === 'kirim_pesan_admin': {
        session.waitingForBantuanMsg = true;
        await bot.sendMessage(chatId, '💬 <b>Silakan ketik pesan Anda untuk Admin:</b>\n\n<i>Pesan Anda akan otomatis diteruskan ke admin PanzzStore.</i>', {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '« Batal', callback_data: 'menu_bantuan' }]]
          }
        });
        break;
      }

      case data === 'menu_bantuan':
        await handleBantuan(bot, chatId, messageId);
        break;

      default:
        break;
    }
  } catch (e) {
    console.error(`Callback error [${data}]:`, e.message);
    try { await bot.sendMessage(chatId, '❌ Terjadi kesalahan. Coba lagi ya!'); } catch {}
  }
});

bot.on('polling_error', (err) => console.error('Polling error:', err.message));

module.exports = { bot };
