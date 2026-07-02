// Shared session store for all bot handlers
const sessions = {};

function getSession(chatId) {
  if (!sessions[chatId]) sessions[chatId] = {};
  return sessions[chatId];
}

function clearSession(chatId) {
  sessions[chatId] = {};
}

module.exports = { sessions, getSession, clearSession };
