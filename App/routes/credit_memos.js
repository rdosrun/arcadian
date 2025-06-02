const express = require('express');
const router = express.Router();

// GET /credit-memo
router.get('/', (req, res) => {
  // Example static data
  const items = [
    {
      customer_credit_memo_number: 'CM-1001',
      customer_credit_memo_customer_name: 'Acme Corp',
      customer_credit_memo_date: '2024-06-01',
      customer_credit_memo_total: 150.75,
      customer_credit_memo_status: 'Open',
      customer_credit_memo_memo: 'Refund for overpayment'
    },
    {
      customer_credit_memo_number: 'CM-1002',
      customer_credit_memo_customer_name: 'Beta LLC',
      customer_credit_memo_date: '2024-06-02',
      customer_credit_memo_total: 200.00,
      customer_credit_memo_status: 'Closed',
      customer_credit_memo_memo: 'Product return'
    }
  ];
  res.json({
    success: true,
    data: { items }
  });
});

module.exports = router;