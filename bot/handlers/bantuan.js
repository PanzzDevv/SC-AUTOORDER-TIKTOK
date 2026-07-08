const { escapeHTML, editMain } = require('../utils');
const storeName = process.env.STORE_NAME || 'PanzzStore';

async function handleBantuan(bot, chatId, messageId) {
  const adminUsername = process.env.ADMIN_USERNAME || 'panzzstore_admin';

const text = `🆘 <b>Pusat Bantuan ${escapeHTML(storeName)}</b>

Jika mengalami kendala transaksi atau ada pertanyaan seputar stok, silakan hubungi admin kami:
📞 Admin: @${escapeHTML(adminUsername)}`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '📞 Hubungi Admin', url: `https://t.me/${adminUsername}` }],
      [{ text: '🔙 Menu Utama',   callback_data: 'back_menu' }],
    ],
  };

  await editMain(bot, chatId, text, keyboard, messageId);
}

module.exports = { handleBantuan };
