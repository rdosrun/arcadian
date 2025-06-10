const express = require('express');
const router = express.Router();
const netsuite = require('../../netsuite'); // Adjust path if needed

// In-memory cache
let salesOrdersCache = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

async function refreshSalesOrdersCache() {
  try {
    salesOrdersCache = await netsuite.Sales_Orders();
    lastFetchTime = Date.now();
  } catch (err) {
    // Optionally log error
  }
}

// Initial cache fill
refreshSalesOrdersCache();
// Set interval to refresh cache every 5 minutes
setInterval(refreshSalesOrdersCache, CACHE_DURATION_MS);

// GET /sales-orders
router.get('/', async (req, res) => {
  if (Date.now() - lastFetchTime > CACHE_DURATION_MS) {
    await refreshSalesOrdersCache();
  }
  res.json({
    success: true,
    data: { items: salesOrdersCache }
  });
});

module.exports = router;
