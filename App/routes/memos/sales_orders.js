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
  
  let salesOrders = JSON.parse(salesOrdersCache).items;
  
  // If user is not an employee, filter sales orders by related customers
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
    data: { items: salesOrders }
  });
});

module.exports = router;
