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
function make_pdf(){
    const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Add each item from the array to the PDF
      cart.forEach((item, index) => {
        console.log(item);
        doc.text(item.name + ' - ' + item.ID, 10, 10 + index * 10); // Adjust y-position for each item
      });

      // Save the PDF
      doc.save('generated.pdf');
}
