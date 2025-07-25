const express = require('express');
const router = express.Router();
const netsuite = require('../backend/netsuite'); // Adjust path if needed

// In-memory cache
let invoicesCache = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 1000;

async function refreshInvoicesCache() {
  try {
    let allItems = [];
    let offset = 0;
    while (true) {
      const pageData = await netsuite.Invoices(offset);
      const parsed = JSON.parse(pageData);
      if (parsed.items && parsed.items.length > 0) {
        allItems = allItems.concat(parsed.items);
        if (parsed.items.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      } else {
        break;
      }
    }
    invoicesCache = JSON.stringify({ items: allItems });
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
  
  let invoices = JSON.parse(invoicesCache).items;
  
  // If user is not an employee, filter invoices by related customers
 if (!req.session.isEmployee && req.session.relatedCustomers) {
    const relatedCustomerIds = req.session.relatedCustomers.map(customer => customer.id);
    console.log('Filtering invoices for related customers:', relatedCustomerIds);
    invoices = invoices.filter(invoice => 
      relatedCustomerIds.includes(invoice.customer_invoice_customer_internal_id) ||
      req.session.customer_id === invoice.customer_invoice_customer_internal_id
    );
  }else if(!req.session.isEmployee) {
    invoices = invoices.filter(invoice => 
      req.session.customer_id === invoice.customer_invoice_customer_internal_id
    );
    console.log('No related customers found for non-employee user.');
  }
  
  res.json({
    success: true,
    data: { items: invoices }
  });
});

module.exports = router;
