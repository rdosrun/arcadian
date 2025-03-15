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
        fetch("/item/"+productId).then(response => 
            response.json().then(data => ({
                data: data,
                status: response.status
            })
        ).then(res => {
            console.log(res);
            var data = res.data.results;
            if (res.data.success) {
                const itemName = data.item_display_name;
                cart.push({ name: itemName, ID: productId });
                updateCart();
            } else {
                console.error("Item not found:", data.message);
            }
        }));
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
    const payload = {
        cart: cart.map(item => ({
            ID: item.ID,
            name: item.name
        })),
        customer: {
            customer_internal_id: customer.customer_internal_id,
            customer_company_name: customer.customer_company_name
        }
    };

    try {
        const response = await fetch('/submit-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Order placed successfully:', data);
            alert('Order placed successfully!');
        } else {
            console.error('Failed to place order:', data.message);
            alert('Failed to place order: ' + data.message);
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    }
}
