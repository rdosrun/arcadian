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
                for (var i = 0; i < data.length; i=i+4) {
                    const imgSrc = data[i].imageUrl;
                    const imgSrc1 = data[i+1].imageUrl;
                    const imgSrc2 = data[i+2].imageUrl;
                    const imgSrc3 = data[i+3].imageUrl;
                    const newItem = document.createElement('div');
                    newItem.className = 'item';
                    newItem.id = i + 1;
                    newItem.innerHTML = `
                    <img src="${imgSrc}" alt="Product Image">
                    <img src="${imgSrc1}" alt="Product Image">
                    <img src="${imgSrc2}" alt="Product Image">
                    <img src="${imgSrc3}" alt="Product Image">
                    `;

                    storeItemsContainer.appendChild(newItem);
                }
            }
        )
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

