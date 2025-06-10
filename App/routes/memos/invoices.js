const express = require('express');
const router = express.Router();
const netsuite = require('../backend/netsuite'); // Adjust path if needed

// In-memory cache
let invoicesCache = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

async function refreshInvoicesCache() {
  try {
    invoicesCache = await netsuite.Invoices();
    lastFetchTime = Date.now();
  } catch (err) {
    // Optionally log error
  }
}

// Initial cache fill
refreshInvoicesCache();
// Set interval to refresh cache every 5 minutes
setInterval(refreshInvoicesCache, CACHE_DURATION_MS);

// GET /invoices
router.get('/', async (req, res) => {
  if (Date.now() - lastFetchTime > CACHE_DURATION_MS) {
    await refreshInvoicesCache();
  }
  res.json({
    success: true,
    data: { items: invoicesCache }
  });
});

module.exports = router;
