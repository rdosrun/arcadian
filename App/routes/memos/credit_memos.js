const express = require('express');
const router = express.Router();
const netsuite = require('../backend/netsuite'); // Adjust path if needed

// In-memory cache
let creditMemosCache = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 1000;

async function refreshCreditMemosCache() {
  try {
    let allItems = [];
    let offset = 0;
    while (true) {
      const pageData = await netsuite.Credit_Memo(offset);
      const parsed = JSON.parse(pageData);
      if (parsed.items && parsed.items.length > 0) {
        allItems = allItems.concat(parsed.items);
        if (parsed.items.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      } else {
        break;
      }
    }
    creditMemosCache = JSON.stringify({ items: allItems });
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
  
  let creditMemos = JSON.parse(creditMemosCache).items;
  
  // If user is not an employee, filter credit memos by related customers
  if (!req.session.isEmployee && req.session.relatedCustomers) {
    const relatedCustomerIds = req.session.relatedCustomers.map(customer => customer.id);
    console.log('Filtering sales orders for related customers:', relatedCustomerIds);
    salesOrders = salesOrders.filter(order => 
      relatedCustomerIds.includes(order.sales_order_customer_internal_id) ||
      req.session.customer_id === order.sales_order_customer_internal_id
    );
  }else if(!req.session.isEmployee) {
    salesOrders = salesOrders.filter(order => 
      req.session.customer_id === order.sales_order_customer_internal_id
    );
    console.log('No related customers found for non-employee user.');
  }
  
  res.json({
    success: true,
    data: { items: creditMemos }
  });
});

module.exports = router;
