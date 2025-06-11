//const { Query_Customers } = require("../../routes/backend/netsuite");

// Store the cart items

    var cart = [];
    var totalPrice = 0;

function addToCart(button) {
    // Get the item details from the parent element
    console.log(button);
    const item = button.split('/');
    var itemID = item[3];
    if(itemID[itemID.length - 1] == "_"){
        itemID = itemID.slice(0, -1); // Remove trailing underscore if present
        itemID = itemID + ".";
    }
    try{
        let name = fetch("/item/"+itemID).then(response => response.json()).then(
            data => {
                var inventory = JSON.parse(localStorage.getItem('inventory'));
                console.log(data);
                for( let i =0;i<inventory.length;i++){
                    if(inventory[i].upc == itemID){
                        if(inventory[i].quantity <= 0 || inventory[i].quantity == undefined){
                            alert("Item is out of stock. Please select another item.");
                            return;
                        }
                    }
                }
                if(data.results.item_display_name == undefined){
                    cart.push({ name: "", ID: itemID,State:"" });
                }else{
                    cart.push({ name: data.results.item_display_name, ID: itemID, State: document.querySelector('input[name="state"]:checked').value });
                }
                
                updateCart();
            }
        );
    } catch (error) {
        alert("Item is out of stock. Please select another item.");
        return;
    }
    // Add the item to the cart
    

    // Update the cart display
    
}

async function addToCartManual(upc) {
    if (!upc) {
        console.error("UPC is empty.");
        return;
    }

    try {
        fetch("/item/" + upc).then(response => 
            response.json().then(data => ({
                data: data,
                status: response.status
            })
        ).then(res => {
            console.log(res);
            var data = res.data.results;
            if (res.data.success) {
                const itemName = data.item_display_name;
                cart.push({ name: itemName, ID: upc });
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
    document.getElementById('cart-count').innerHTML = cart.length;
    console.log(cart);
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
            console.log(item);
            var tmp = item.ID;
            if(tmp[tmp.length - 1] == "."){
                tmp = tmp.slice(0, -1); // Remove trailing dot if present
                tmp = tmp+ "_";
            }
            img.src = `/images/${item.State}/${tmp}/1.jpg`; // Assuming images are stored with product ID as filename
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
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = customer.customer_company_name;
            button.onclick = () => selectCustomer(customer);

            // Add styling to make the button look nice
            button.style.padding = '10px 20px';
            button.style.margin = '5px 0';
            button.style.border = '1px solid #ccc';
            button.style.borderRadius = '5px';
            button.style.backgroundColor = '#f9f9f9';
            button.style.cursor = 'pointer';
            button.style.width = '100%';
            button.style.textAlign = 'left';
            button.style.color = 'black';

            button.onmouseover = () => (button.style.backgroundColor = '#e0e0e0');
            button.onmouseout = () => (button.style.backgroundColor = '#f9f9f9');

            li.appendChild(button);
            customerList.appendChild(li);
    });

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('customer-modal');
    modal.style.display = 'none';
    cart = [];
    updateCart();
}

// Show confirmation popup before placing order
function selectCustomer(customer) {
    selectedCustomer = customer.customer_company_name;
    console.log('Selected customer:', customer);

    // Create confirmation popup
    const confirmPopup = document.createElement('div');
    confirmPopup.style.position = 'fixed';
    confirmPopup.style.top = '50%';
    confirmPopup.style.left = '50%';
    confirmPopup.style.transform = 'translate(-50%, -50%)';
    confirmPopup.style.background = 'white';
    confirmPopup.style.padding = '30px';
    confirmPopup.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
    confirmPopup.style.zIndex = '1000001';
    confirmPopup.style.borderRadius = '8px';
    confirmPopup.style.textAlign = 'center';

    const nameText = document.createElement('div');
    nameText.textContent = `Place order for: ${customer.customer_company_name}?`;
    nameText.style.marginBottom = '20px';

    const okBtn = document.createElement('button');
    okBtn.textContent = 'Okay';
    okBtn.style.marginRight = '10px';
    okBtn.onclick = () => {
        document.body.removeChild(confirmPopup);
        place_order(customer).then(() => {
            closeModal();
        });
    };

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => {
        document.body.removeChild(confirmPopup);
        // Do not place order, just close popup
    };

    confirmPopup.appendChild(nameText);
    confirmPopup.appendChild(okBtn);
    confirmPopup.appendChild(closeBtn);

    document.body.appendChild(confirmPopup);
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
    // Show loading spinner
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.className = 'loader';
    spinner.style.position = 'fixed';
    spinner.style.top = '50%';
    spinner.style.left = '50%';
    spinner.style.zIndex = '1000000000';

    // Create overlay to gray out the rest of the page
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '99999999';
    //overlay.style.pointerEvents = 'none';

    document.body.appendChild(overlay);
    document.body.appendChild(spinner);

    try {
        const payload = {
            cart: cart.map(item => ({
                ID: item.ID,
                name: item.ID,
                interal_ID: JSON.parse(localStorage.getItem('inventory')).find(i => (i.upc === item.ID && i.isinactive =='F'))?.internal_id || '',
            })),
            customer: {
                customer_internal_id: customer.customer_internal_id,
                customer_company_name: customer.customer_company_name
            }
        };

        const response = await fetch('/submit-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response from server:', data);
        if (data.success) {
            console.log('Order placed successfully:', data);
            alert('Order placed successfully!');
        } else {
            console.error('Failed to place order:', data.message);
            alert('Failed to place order: ' + data.message);
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
    } finally {
        // Remove loading spinner and overlay
        document.body.removeChild(spinner);
        document.body.removeChild(overlay);
    }
}

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);
