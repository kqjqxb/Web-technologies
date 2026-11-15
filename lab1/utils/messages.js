// Повідомлення чату: автор, текст, час і тип (admin – системне, user – від учасника, auto – автоматичне)
function formatMessage(username, text, type = 'user', senderId = null) {
  const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return { username, text, time, type, senderId };
}

module.exports = formatMessage;
