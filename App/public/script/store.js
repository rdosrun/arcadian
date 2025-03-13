const { Query_Customers } = require("../../routes/backend/netsuite");

// Store the cart items
let cart = [];
let totalPrice = 0;

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

function addToCartManual(itemName) {
    // Get the item details from the page
    const item = document.getElementById("product_id").getvalue();
    // Add the item to the cart
    cart.push({ name: itemName, ID: item });

    // Update the cart display
    updateCart();
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

let selectedCustomer = null;

async function checkout() {
    const customers = await fetch('/customers')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching customers:', error);
        });

    if (customers) {
        displayCustomerModal(customers);
    }
}

function displayCustomerModal(customers) {
    const modal = document.getElementById('customer-modal');
    const customerList = document.getElementById('customer-list');
    customerList.innerHTML = '';

    customers.forEach(customer => {
        const li = document.createElement('li');
        li.textContent = customer.name;
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
    selectedCustomer = customer;
    console.log('Selected customer:', customer);
}

function confirmCustomer() {
    if (selectedCustomer) {
        console.log('Customer confirmed:', selectedCustomer);
        closeModal();
        // Proceed with placing the order
        place_order();
    } else {
        alert('Please select a customer.');
    }
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

async function place_order() {
    

    const payload = {
        customerId: 10,
        customerName: "**BD Test Customer",
        salesRep: 3,
        orderDate: "02/24/2025",
        shipDate: "02/25/2025",
        fulfillmentLocation: 1,
        poNumber: "PO12345",
        memo: "This is a new sales order",
        billToSelected: 1,
        shipToSelected: 1,
        customShippingAddress: {
            attention: "John Doe",
            addressee: "**BD Test Customer",
            addr1: "123 Main St.",
            addr2: "Suite 100",
            city: "San Francisco",
            state: "CA",
            zip: "94105",
            country: "United States"
        },
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
