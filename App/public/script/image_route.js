var total_hats = 50;
var curr_hats = 0;
var state = "";
function update_hats() {
    const selectedState = document.querySelector('input[name="state"]:checked').value;
    const storeItemsContainer = document.getElementById('store-items');
    storeItemsContainer.setAttribute('data-state', selectedState);
    storeItemsContainer.innerHTML = ''; // Clear existing items
    fetch("/images/" + selectedState)
        .then(response => response.json())
        .then(data => {
            const paneCount = 4;
            const itemsPerPane = Math.ceil(data.length / paneCount);
            console.log(data);
            for (let paneIndex = 0; paneIndex < paneCount; paneIndex++) {
                const pane = document.createElement('div');
                pane.className = 'pane';

                const start = paneIndex * itemsPerPane;
                const end = start + itemsPerPane;

                data.slice(start, end).forEach(item => {
                    const button = document.createElement('button');
                    button.className = 'item';
                    button.setAttribute('onClick', 'addToCart(this)');
                    button.id = item.id;

                    const img = document.createElement('img');
                    img.src = item.imageUrl;
                    img.alt = `Item ${item.id}`;

                    const priceDiv = document.createElement('div');
                    priceDiv.className = 'price';
                    priceDiv.textContent = `$${item.price}`;

                    button.appendChild(img);
                    button.appendChild(priceDiv);
                    pane.appendChild(button);
                });

                storeItemsContainer.appendChild(pane);
            }
        })
        .catch(error => console.error('Error fetching images:', error));
}

function load_state(){
    update_hats();
}

function duplicateElement() {
    // Get the original element with id "1"
    const originalElement = document.getElementById("1");
    if (!originalElement) {
        console.error('Element with id "1" not found.');
        return;
    }

    // Get the container div with id "store-items"
    const storeItems = document.getElementById("store-items");
    if (!storeItems) {
        console.error('Div with id "store-items" not found.');
        return;
    }
    if(state == ""){
        return;
    }
    for(let i = 1; i <= total_hats; i++){
        var x = "";
        if(document.getElementById(i) == null){
            var newElement = originalElement.cloneNode(true);
            newElement.id = i;
            newElement.querySelector("img").src = x;
            storeItems.appendChild(newElement);
        }
        if(i < curr_hats){
            var x = `/product_images/${state}/${i}.jpg`;
            document.getElementById(i).querySelector("img").src = x;
            document.getElementById(i).style.display = "inline";
        } else {
            document.getElementById(i).style.display = "none";
        }
    }
}

