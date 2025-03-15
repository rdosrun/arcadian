//const { Query_Customers } = require("../../routes/backend/netsuite");

// Store the cart items

    var cart = [];
    var totalPrice = 0;

function addToCart(button) {
    // Get the item details from the parent element
    const item = button.children[0].getAttribute('src').split('/');
    const itemName = item[3];
    const itemID = item[4].split('.')[0];

    // Add the item to the cart
    cart.push({ name: itemName, ID: itemID });

    // Update the cart display
    updateCart();
}

async function addToCartManual() {
    const productId = document.getElementById("product_id").value;
    if (!productId) {
        console.error("Product ID is empty.");
        return;
    }

    try {
        const response = await fetch("/item/"+productId);
        
        const data = await response.json();
        console.log(response,data);
        if (data.success) {
            const itemName = data.name;
            cart.push({ name: itemName, ID: productId });
            updateCart();
        } else {
            console.error("Item not found:", data.message);
        }
    } catch (error) {
        console.error("Error fetching item name:", error);
    }
}

function updateCart() {
    // Get the cart items list and clear it
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    // Add each item to the cart display
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.ID}`;
        li.appendChild(createRemoveButton(index));
        cartItems.appendChild(li);
    });

    // Update the total price
    //document.getElementById('total-price').textContent = totalPrice.toFixed(2);
}

function createRemoveButton(index) {
    const button = document.createElement('button');
    button.textContent = 'Remove';
    button.style.marginLeft = '10px';
    button.onclick = function () {
        // Remove the item from the cart
        totalPrice -= cart[index].price;
        cart.splice(index, 1);
        updateCart();
    };
    return button;
}

var selectedCustomer = null;

async function checkout() {
    const customers = await fetch('/customers')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching customers:', error);
        });

    if (customers) {
        console.log('Customers:', customers.items);
        displayCustomerModal(customers.items);
    }
}

function displayCustomerModal(customers) {
    const modal = document.getElementById('customer-modal');
    const customerList = document.getElementById('customer-list');
    customerList.innerHTML = '';

    customers.forEach(customer => {
        const li = document.createElement('li');
        li.textContent = customer.customer_company_name;
        li.onclick = () => selectCustomer(customer);
        customerList.appendChild(li);
    });

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('customer-modal');
    modal.style.display = 'none';
}

function selectCustomer(customer) {
    selectedCustomer = customer.customer_company_name;
    console.log('Selected customer:', customer);
    place_order(customer);
}


function filterCustomers() {
    const searchInput = document.getElementById('customer-search').value.toLowerCase();
    const customerList = document.getElementById('customer-list');
    const customers = customerList.getElementsByTagName('li');

    for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        if (customer.textContent.toLowerCase().includes(searchInput)) {
            customer.style.display = '';
        } else {
            customer.style.display = 'none';
        }
    }
}

async function place_order(customer) {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 because months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    const formattedDate = `${month}/${day}/${year}`;


    const payload = {
        customerId: customer.customer_internal_id,
        customerName: customer.customer_company_name,
        salesRep: 3,
        orderDate: formattedDate,
        shipDate: formattedDate,
        fulfillmentLocation: 1,
        poNumber: "PO12345",
        memo: "This is a new sales order",
        billToSelected: 1,
        shipToSelected: 1,
        items: cart.map(item => ({
            itemInternalId: item.ID,
            itemName: item.name,
            quantity: 1, // You can adjust the quantity as needed
            priceLevel: null,
            rate: null,
            location: 1
        }))
    };

    fetch(`https://11374585.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=905&deploy=1`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // Replace with your access token
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Order placed successfully:', data);
    })
    .catch(error => {
        console.error('Error placing order:', error);
    });
    return t;
}
