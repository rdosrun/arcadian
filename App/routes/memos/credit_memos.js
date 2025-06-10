const express = require('express');
const router = express.Router();
const netsuite = require('../backend/netsuite'); // Adjust path if needed

// In-memory cache
let creditMemosCache = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

async function refreshCreditMemosCache() {
  try {
    creditMemosCache = await netsuite.Credit_Memo();
    lastFetchTime = Date.now();
  } catch (err) {
    // Optionally log error
  }
}

// Initial cache fill
refreshCreditMemosCache();
// Set interval to refresh cache every 5 minutes
setInterval(refreshCreditMemosCache, CACHE_DURATION_MS);

// GET /credit-memos
router.get('/', async (req, res) => {
  if (Date.now() - lastFetchTime > CACHE_DURATION_MS) {
    await refreshCreditMemosCache();
  }
  res.json({
    success: true,
    data: { items: creditMemosCache }
  });
});

module.exports = router;
