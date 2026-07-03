const env = require('../config/env');

const sendZaloNotification = async (message, metadata = {}) => {
  if (!env.ZALO_WEBHOOK_URL) {
    return {
      skipped: true,
      reason: 'Zalo webhook is not configured'
    };
  }

  if (typeof fetch !== 'function') {
    return {
      skipped: true,
      reason: 'Global fetch is not available in this Node.js runtime'
    };
  }

  const response = await fetch(env.ZALO_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(env.ZALO_ACCESS_TOKEN
        ? {
            Authorization: `Bearer ${env.ZALO_ACCESS_TOKEN}`
          }
        : {})
    },
    body: JSON.stringify({
      text: message,
      metadata
    })
  });

  if (!response.ok) {
    throw new Error(`Zalo notification failed with status ${response.status}`);
  }

  return {
    delivered: true
  };
};

module.exports = {
  sendZaloNotification
};
