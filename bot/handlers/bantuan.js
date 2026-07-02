const { escapeHTML, editMain } = require('../utils');
const storeName = process.env.STORE_NAME || 'PanzzStore';

const FAQ = [
  { q: 'Apa itu akun muda & akun tua?',    a: 'Akun muda baru dibuat. Akun tua sudah lama ada dan punya riwayat aktivitas.' },
  { q: 'Bedanya garansi & no garansi?',     a: 'Akun bergaransi diganti jika bermasalah dalam waktu yang ditentukan. No garansi dijual apa adanya.' },
  { q: 'Berapa lama pengiriman?',           a: 'Otomatis setelah pembayaran dikonfirmasi, biasanya kurang dari 1 menit.' },
  { q: 'Cara bayar?',                       a: 'Melalui link Pakasir yang dibuat otomatis setelah order.' },
];

async function handleBantuan(bot, chatId, messageId) {
  const adminUsername = process.env.ADMIN_USERNAME || 'panzzstore_admin';

  const faqText = FAQ.map((f, i) =>
    `<b>${i + 1}. ${escapeHTML(f.q)}</b>\n<i>${escapeHTML(f.a)}</i>`
  ).join('\n\n');

  const text = `🆘 <b>Pusat Bantuan ${storeName}</b>

${faqText}

<blockquote>📞 Hubungi Admin: @${escapeHTML(adminUsername)}</blockquote>`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '📞 Hubungi Admin', url: `https://t.me/${adminUsername}` }],
      [{ text: '🔙 Menu Utama',   callback_data: 'back_menu' }],
    ],
  };

  await editMain(bot, chatId, text, keyboard, messageId);
}

module.exports = { handleBantuan };
