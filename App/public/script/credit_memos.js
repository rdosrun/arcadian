// credit_memos.js

// Fetch credit memos from backend API
async function fetchCreditMemos() {
    try {
        const res = await fetch('/api/credit-memos');
        const json = await res.json();
        console.log('Fetched credit memos:', json);
        if (json.success && Array.isArray(json.data.items)) {
            const memos = json.data.items.map(item => ({
                memoNumber: item.customer_credit_memo_number || '',
                customer: item.customer_credit_memo_customer_name || '',
                date: item.customer_credit_memo_date || '',
                amount: Number(item.customer_credit_memo_total) || 0,
                status: item.customer_credit_memo_status || '',
                details: item.customer_credit_memo_memo || ''
            }));
            renderCreditMemos(memos);
            return; // No need to return memos
        }
        renderCreditMemos([]); // Render empty if no data
    } catch (e) {
        console.error('Failed to fetch credit memos:', e);
        renderCreditMemos([]);
    }
}

function renderCreditMemos(memos) {
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

function filterMemos(memos, query) {
    query = query.trim().toLowerCase();
    return memos.filter(memo =>
        (memo.memoNumber || '').toLowerCase().includes(query) ||
        (memo.customer || '').toLowerCase().includes(query) ||
        (memo.date || '').includes(query)
    );
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchCreditMemos();

    document.getElementById('searchBtn').onclick = () => {
        const query = document.getElementById('searchInput').value;
        // Re-fetch and filter on search
        fetch('/api/credit-memos')
            .then(res => res.json())
            .then(json => {
                if (json.success && Array.isArray(json.data.items)) {
                    const memos = json.data.items.map(item => ({
                        memoNumber: item.customer_credit_memo_number || '',
                        customer: item.customer_credit_memo_customer_name || '',
                        date: item.customer_credit_memo_date || '',
                        amount: Number(item.customer_credit_memo_total) || 0,
                        status: item.customer_credit_memo_status || '',
                        details: item.customer_credit_memo_memo || ''
                    }));
                    renderCreditMemos(filterMemos(memos, query));
                } else {
                    renderCreditMemos([]);
                }
            });
    };
    document.getElementById('searchInput').addEventListener('keyup', e => {
        if (e.key === 'Enter') {
            const query = e.target.value;
            fetch('/api/credit-memos')
                .then(res => res.json())
                .then(json => {
                    if (json.success && Array.isArray(json.data.items)) {
                        const memos = json.data.items.map(item => ({
                            memoNumber: item.customer_credit_memo_number || '',
                            customer: item.customer_credit_memo_customer_name || '',
                            date: item.customer_credit_memo_date || '',
                            amount: Number(item.customer_credit_memo_total) || 0,
                            status: item.customer_credit_memo_status || '',
                            details: item.customer_credit_memo_memo || ''
                        }));
                        renderCreditMemos(filterMemos(memos, query));
                    } else {
                        renderCreditMemos([]);
                    }
                });
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
