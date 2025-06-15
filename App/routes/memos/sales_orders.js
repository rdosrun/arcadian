const express = require('express');
const router = express.Router();
const netsuite = require('../backend/netsuite'); // Adjust path if needed

// In-memory cache
let salesOrdersCache = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 1000;

async function refreshSalesOrdersCache() {
  try {
    let allItems = [];
    let offset = 0;
    while (true) {
      const pageData = await netsuite.Sales_Orders(offset);
      const parsed = JSON.parse(pageData);
      if (parsed.items && parsed.items.length > 0) {
        allItems = allItems.concat(parsed.items);
        if (parsed.items.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      } else {
        break;
      }
    }
    salesOrdersCache = JSON.stringify({ items: allItems });
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
    data: { items: JSON.parse(salesOrdersCache).items }
  });
});

module.exports = router;
