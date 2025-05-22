// credit_memos.js
// Demo data for credit memos (replace with real API call in production)
const demoCreditMemos = [
    {
        memoNumber: 'CM-1001',
        customer: 'Acme Corp',
        date: '2025-05-01',
        amount: 250.00,
        status: 'Open',
        details: 'Returned 5 hats, restocked.'
    },
    {
        memoNumber: 'CM-1002',
        customer: 'Beta LLC',
        date: '2025-05-10',
        amount: 120.50,
        status: 'Closed',
        details: 'Refund for defective item.'
    },
    {
        memoNumber: 'CM-1003',
        customer: 'Gamma Inc',
        date: '2025-05-15',
        amount: 75.00,
        status: 'Open',
        details: 'Credit for late shipment.'
    }
];

function renderCreditMemos(memos) {
    const tbody = document.querySelector('#creditMemosTable tbody');
    tbody.innerHTML = '';
    memos.forEach(memo => {
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

function filterMemos(query) {
    query = query.trim().toLowerCase();
    return demoCreditMemos.filter(memo =>
        memo.memoNumber.toLowerCase().includes(query) ||
        memo.customer.toLowerCase().includes(query) ||
        memo.date.includes(query)
    );
}

document.addEventListener('DOMContentLoaded', () => {
    renderCreditMemos(demoCreditMemos);

    document.getElementById('searchBtn').onclick = () => {
        const query = document.getElementById('searchInput').value;
        renderCreditMemos(filterMemos(query));
    };
    document.getElementById('searchInput').addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            renderCreditMemos(filterMemos(e.target.value));
        }
    });

    document.querySelector('#creditMemosTable tbody').onclick = function(e) {
        if (e.target.classList.contains('details-btn')) {
            const memo = JSON.parse(e.target.getAttribute('data-memo'));
            showMemoDetails(memo);
        }
    };

    // Modal logic
    const modal = document.getElementById('memoDetailsModal');
    const closeBtn = document.querySelector('.modal .close');
    closeBtn.onclick = () => { modal.style.display = 'none'; };
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});

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
