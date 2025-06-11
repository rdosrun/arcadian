// credit_memos.js

var curr_tab = 'credit-memos'; // Default tab

var memos = [];
var orders = [];
var invoices = [];

// Fetch credit memos from backend API
async function fetchCreditMemos() {
    try {
        const res = await fetch('/api/credit-memos');
        const json = await res.json();
        console.log('Fetched credit memos:', json);
        if (json.success && Array.isArray(json.data.items)) {
            memos = json.data.items.map(item => ({
                memoNumber: item.customer_credit_memo_number || '',
                customer: item.customer_credit_memo_customer_name || '',
                date: item.customer_credit_memo_date || '',
                amount: Number(item.customer_credit_memo_total) || 0,
                status: item.customer_credit_memo_status || '',
                details: item.customer_credit_memo_memo || ''
            }));
            renderCreditMemos();
            return;
        }
        renderCreditMemos([]);
    } catch (e) {
        console.error('Failed to fetch credit memos:', e);
        renderCreditMemos([]);
    }
}

async function fetchSalesOrders() {
    try {
        const res = await fetch('/api/sales-orders');
        const json = await res.json();
        console.log('Fetched sales orders:', json);
        if (json.success && Array.isArray(json.data.items)) {
            orders = json.data.items.map(item => ({
                orderNumber: item.sales_order_number || '',
                customer: item.sales_order_customer_company_name || '',
                date: item.sales_order_date || '',
                amount: Number(item.sales_order_total) || 0,
                status: item.sales_order_status_order_name || '',
                details: item.sales_order_memo || ''
            }));
            renderSalesOrders();
            return;
        }
        renderSalesOrders([]);
    } catch (e) {
        console.error('Failed to fetch sales orders:', e);
        renderSalesOrders([]);
    }
}

async function fetchInvoices() {
    try {
        const res = await fetch('/api/invoices');
        const json = await res.json();
        console.log('Fetched invoices:', json);
        if (json.success && Array.isArray(json.data.items)) {
            invoices = json.data.items.map(item => ({
                invoiceNumber: item.customer_invoice_number || '',
                customer: item.customer_invoice_customer_name || '',
                date: item.customer_invoice_date || '',
                amount: Number(item.customer_invoice_total) || 0,
                status: item.customer_invoice_status_name || '',
                details: item.customer_invoice_memo || ''
            }));
            renderInvoices();
            return;
        }
        renderInvoices([]);
    } catch (e) {
        console.error('Failed to fetch invoices:', e);
        renderInvoices([]);
    }
}

function renderCreditMemos(memosToRender = memos) {
    // Check if the table element already exists, if not, create it with id 'credit_table'
    let table = document.getElementById('credit_table');
    if (!table) {
        table = document.createElement('table');
        table.id = 'credit_table';
        // Optionally, add classes or attributes as needed
        // Insert the table into the DOM (for example, inside a container)
        const container = document.getElementById('creditMemosTableContainer') || document.body;
        container.appendChild(table);
        // Optionally, add thead/tbody structure if needed
    }
    const tbody = document.querySelector('#creditMemosTable tbody');
    tbody.innerHTML = '';
    memosToRender.forEach(memo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${memo.memoNumber}</td>
            <td>${memo.customer}</td>
            <td>${memo.date}</td>
            <td>$${memo.amount.toFixed(2)}</td>
            <td>${memo.status}</td>
            <td><button class="details-btn" data-memo='${JSON.stringify(memo)}'>View</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderSalesOrders(ordersToRender = orders) {
    const tbody = document.querySelector('#salesOrdersTable tbody');
    tbody.innerHTML = '';
    ordersToRender.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.customer}</td>
            <td>${order.date}</td>
            <td>$${order.amount.toFixed(2)}</td>
            <td>${order.status}</td>
            <td><button class="details-btn" data-order='${JSON.stringify(order)}'>View</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderInvoices(invoicesToRender = invoices) {
    const tbody = document.querySelector('#invoicesTable tbody');
    tbody.innerHTML = '';
    invoicesToRender.forEach(invoice => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${invoice.invoiceNumber}</td>
            <td>${invoice.customer}</td>
            <td>${invoice.date}</td>
            <td>$${invoice.amount.toFixed(2)}</td>
            <td>${invoice.status}</td>
            <td><button class="details-btn" data-invoice='${JSON.stringify(invoice)}'>View</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function Search(){
    const query = document.getElementById('searchInput').value;
    const floor = document.getElementById('amountInputMin').value;
    const ceiling = document.getElementById('amountInputMax').value;
    const tab = curr_tab;

    if (tab === 'credit-memos') {
        fetchCreditMemos().then(() => {
            const filteredMemos = filterMemos(memos, query,floor, ceiling);
            renderCreditMemos(filteredMemos);
        });
    } else if (tab === 'sales-orders') {
        fetchSalesOrders().then(() => {
            const filteredOrders = filterSalesOrders(orders, query, floor, ceiling);
            renderSalesOrders(filteredOrders);
        });
    } else if (tab === 'invoices') {
        fetchInvoices().then(() => {
            const filteredInvoices = filterInvoices(invoices, query, floor, ceiling);
            renderInvoices(filteredInvoices);
        });
    }
}

function filterMemos(memos, query,floor, ceiling) {
    query = query.trim().toLowerCase();
    console.log('Filtering memos with query:', query, memos);
    return memos.filter(memo =>
        ((memo.memoNumber || '').toLowerCase().includes(query) ||
        (memo.customer || '').toLowerCase().includes(query) ||
        (memo.date || '').includes(query)) &&
        (memo.amount >= parseFloat(floor) || isNaN(parseFloat(floor))) &&
        (memo.amount <= parseFloat(ceiling) || isNaN(parseFloat(ceiling)))
    );
}

function filterSalesOrders(orders, query, floor, ceiling) {
    query = query.trim().toLowerCase();
    return orders.filter(order =>
        ((order.orderNumber || '').toLowerCase().includes(query) ||
        (order.customer || '').toLowerCase().includes(query) ||
        (order.date || '').includes(query)) &&
        (order.amount >= parseFloat(floor) || isNaN(parseFloat(floor))) &&
        (order.amount <= parseFloat(ceiling) || isNaN(parseFloat(ceiling)))
    );
}

function filterInvoices(invoices, query, floor, ceiling) {
    query = query.trim().toLowerCase();
    return invoices.filter(invoice =>
        ((invoice.invoiceNumber || '').toLowerCase().includes(query) ||
        (invoice.customer || '').toLowerCase().includes(query) ||
        (invoice.date || '').includes(query)) &&
        (invoice.amount >= parseFloat(floor) || isNaN(parseFloat(floor))) &&
        (invoice.amount <= parseFloat(ceiling) || isNaN(parseFloat(ceiling)))
    );
} 


function showMemoDetails(memo) {
    const detailsDiv = document.getElementById('memoDetails');
    detailsDiv.innerHTML = `
        <h2>Credit Memo Details</h2>
        <p><strong>Memo #:</strong> ${memo.memoNumber}</p>
        <p><strong>Customer:</strong> ${memo.customer}</p>
        <p><strong>Date:</strong> ${memo.date}</p>
        <p><strong>Amount:</strong> $${memo.amount.toFixed(2)}</p>
        <p><strong>Status:</strong> ${memo.status}</p>
        <p><strong>Details:</strong> ${memo.details}</p>
    `;
    document.getElementById('memoDetailsModal').style.display = 'block';
}

function showSalesOrderDetails(order) {
    const detailsDiv = document.getElementById('memoDetails');
    detailsDiv.innerHTML = `
        <h2>Sales Order Details</h2>
        <p><strong>Order #:</strong> ${order.orderNumber}</p>
        <p><strong>Customer:</strong> ${order.customer}</p>
        <p><strong>Date:</strong> ${order.date}</p>
        <p><strong>Amount:</strong> $${order.amount.toFixed(2)}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Details:</strong> ${order.details}</p>
    `;
    document.getElementById('memoDetailsModal').style.display = 'block';
}

function showInvoiceDetails(invoice) {
    const detailsDiv = document.getElementById('memoDetails');
    detailsDiv.innerHTML = `
        <h2>Invoice Details</h2>
        <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Customer:</strong> ${invoice.customer}</p>
        <p><strong>Date:</strong> ${invoice.date}</p>
        <p><strong>Amount:</strong> $${invoice.amount.toFixed(2)}</p>
        <p><strong>Status:</strong> ${invoice.status}</p>
        <p><strong>Details:</strong> ${invoice.details}</p>
    `;
    document.getElementById('memoDetailsModal').style.display = 'block';
}

function showTab(tab) {
    // Update tab title
    document.getElementById('tab-title').textContent =
        tab === 'credit-memos' ? 'Credit Memos' :
        tab === 'sales-orders' ? 'Sales Orders' : 'Invoices';
    curr_tab = tab;
    // Toggle table visibility
    document.getElementById('creditMemosTable').style.display = tab === 'credit-memos' ? '' : 'none';
    document.getElementById('salesOrdersTable').style.display = tab === 'sales-orders' ? '' : 'none';
    document.getElementById('invoicesTable').style.display = tab === 'invoices' ? '' : 'none';

    // Update tab button styles (darker for selected, using .selected class)
    document.getElementById('tab-credit-memos').classList.toggle('selected', tab === 'credit-memos');
    document.getElementById('tab-sales-orders').classList.toggle('selected', tab === 'sales-orders');
    document.getElementById('tab-invoices').classList.toggle('selected', tab === 'invoices');

    // Change search placeholder
    document.getElementById('searchInput').placeholder =
        tab === 'credit-memos' ? "Search by Customer, Memo #, or Date..." :
        tab === 'sales-orders' ? "Search by Customer, Order #, or Date..." :
        "Search by Customer, Invoice #, or Date...";

    // Optionally, trigger fetch for the selected tab
    if (tab === 'credit-memos') {
        fetchCreditMemos();
    } else if (tab === 'sales-orders') {
        fetchSalesOrders();
    } else if (tab === 'invoices') {
        fetchInvoices();
    }
}
