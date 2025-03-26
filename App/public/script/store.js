//const { Query_Customers } = require("../../routes/backend/netsuite");

// Store the cart items

    var cart = [];
    var totalPrice = 0;

function addToCart(button) {
    // Get the item details from the parent element
    console.log(button);
    const item = button.split('/');
    const itemID = item[3];
    let name = fetch("/item/"+itemID).then(response => response.json()).then(
        data => {
            cart.push({ name: data.results.item_display_name, ID: itemID});
        }
    );
    // Add the item to the cart
    

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
    /*const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    // Add each item to the cart display
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.ID}`;
        li.appendChild(createRemoveButton(index));
        cartItems.appendChild(li);
    });*/

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

function toggleCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    if (cartItems.style.display === 'none' || cartItems.style.display === '') {
        var index = 0;
        // Add each item to the cart display
        cart.forEach(item => {
            const li = document.createElement('li');
            const img = document.createElement('img');
            img.src = `/images/${item.name.substring(0,2)}/${item.ID}/1.jpg`; // Assuming images are stored with product ID as filename
            img.alt = item.name;
            img.style.width = '50px';
            img.style.height = '50px';

            li.textContent = `${item.name} - ${item.ID}`;
            li.appendChild(createRemoveButton(index++));

            li.prepend(img);
            cartItems.appendChild(li);
        });

        cartItems.style.display = 'block';
    } else {
        cartItems.style.display = 'none';
    }
    const checkoutButton = document.createElement('div');
    checkoutButton.innerHTML = '<button onclick="checkout()">Place Order</button>';
    cartItems.appendChild(checkoutButton);
}

// Attach the toggleCartDisplay function to the cart button
document.getElementById('cart').addEventListener('click', toggleCartDisplay);

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
        if(customer.customer_company_name == "**BD Test Customer") {
            const li = document.createElement('li');
            li.textContent = customer.customer_company_name;
            li.onclick = () => selectCustomer(customer);
            customerList.appendChild(li);
        }
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
            name: item.ID
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
