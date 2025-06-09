var total_hats = 50;
var curr_hats = 0;
var state = "";
function update_hats() {
    update_inventory(); // Ensure inventory is updated before hats
    console.log("Updating hats...");
    const selectedState = document.querySelector('input[name="state"]:checked').value;
    const storeItemsContainer = document.getElementById('store-items');
    storeItemsContainer.setAttribute('data-state', selectedState);
    storeItemsContainer.innerHTML = ''; // Clear existing items

    // Load inventory from localStorage once
    let inventory = [];
    try {
        inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    } catch (e) {
        inventory = [];
    }

    fetch("/images/" + selectedState)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched images for state:", selectedState, data);
                var total_photots =1;
                var local_inventory = localStorage.getItem('inventory');
                for (var i = 0; i < data.length; i = i + total_photots) {
                    total_photots = 1; 
                    if(data[i] == null ){
                        console.warn("No data for index:", i);
                        continue; // Skip if no data for this index
                    }else if(data[i].imageUrl == null){
                        console.warn("No image URL for item at index:", i);
                        continue; // Skip if no image URL
                    }
                    const imgSrcs = [];
                    for (let j = 0; j < 4; j++) {
                        if(i+j >= data.length){
                            break;
                        }
                        if(data[i+j].imageUrl.split('/')[3] != data[i].imageUrl.split('/')[3]){
                            break;
                        }
                        imgSrcs.push(data[i+j].imageUrl);
                        total_photots = j+1;
                    }
                    if(local_inventory[data[i].imageUrl.split('/')[3]].isinactive == "T"){
                        console.warn("Item is inactive, skipping:", data[i].imageUrl);
                        continue; // Skip if item is inactive
                    }
                    /*const imgSrcs = [
                        data[i]?.imageUrl,
                        data[i + 1]?.imageUrl,
                        data[i + 2]?.imageUrl,
                        data[i + 3]?.imageUrl
                    ]*/

                    const newItem = document.createElement('button');
                    newItem.className = 'item';
                    newItem.id = i + 1;

                    // Add click event to enlarge item and show details
                    newItem.onclick = () => {
                        console.log("Clicked item with ID:", imgSrcs[0].split('/')[3]);
                        var tmp = imgSrcs[0].split('/')[3];
                        if(tmp[tmp.length - 1] == "_"){
                            tmp = tmp.slice(0, -1); // Remove trailing underscore if present
                            tmp = tmp + ".";
                        }
                        enlargeItem(newItem, imgSrcs[0], tmp);
                    };

                    // Create a container for the slideshow
                    const slideshowContainer = document.createElement('div');
                    slideshowContainer.className = 'slideshow-container';
                    slideshowContainer.id = `slideshow-${newItem.id}`;

                    // Get UPC for this item (assume first image's UPC is representative)
                    let upc = null;
                    if (imgSrcs.length > 0 && imgSrcs[0]) {
                        // Try to extract UPC from image URL (assuming split('/')[3] is UPC)
                        upc = imgSrcs[0].split('/')[3];
                    }

                    // Find quantity in inventory
                    let quantity = '';
                    if (upc) {
                        // Try both possible property names for compatibility
                        let invItem = inventory.find(
                            inv => inv.upc === upc
                        );
                        if (invItem) {
                            quantity = invItem.quantity;
                        }
                    }

                    // Add stock number badge
                    const stockBadge = document.createElement('div');
                    stockBadge.className = 'stock-badge';
                    stockBadge.textContent = quantity !== '' ? quantity : '0';
                    stockBadge.style.position = 'absolute';
                    stockBadge.style.top = '5px';
                    stockBadge.style.right = '10px';
                    stockBadge.style.background = 'rgba(0,0,0,0.7)';
                    stockBadge.style.color = 'white';
                    stockBadge.style.padding = '2px 8px';
                    stockBadge.style.borderRadius = '12px';
                    stockBadge.style.fontSize = '14px';
                    stockBadge.style.zIndex = '10';

                    slideshowContainer.appendChild(stockBadge);

                    imgSrcs.forEach((src, index) => {
                        const slide = document.createElement('div');
                        slide.className = 'slide';
                        slide.style.display = index === 0 ? 'block' : 'none'; // Show the first image by default
                        slide.innerHTML = `<img src="${src}" alt="Product Image">`;
                        slideshowContainer.appendChild(slide);
                    });

                    // Add navigation buttons for the slideshow
                    const prevButton = document.createElement('button');
                    prevButton.className = 'prev';
                    prevButton.innerHTML = '&#10094;';
                    prevButton.onclick = (event) => {
                        event.stopPropagation();
                        changeSlide(newItem.id, -1);
                    };
                    prevButton.style.position = 'absolute';
                    prevButton.style.left = '0';
                    prevButton.style.top = '50%';
                    prevButton.style.transform = 'translateY(-50%)';
                    prevButton.style.background = 'rgba(0, 0, 0, 0.5)';
                    prevButton.style.color = 'white';
                    prevButton.style.border = 'none';
                    prevButton.style.cursor = 'pointer';

                    const nextButton = document.createElement('button');
                    nextButton.className = 'next';
                    nextButton.innerHTML = '&#10095;';
                    nextButton.onclick = (event) => {
                        event.stopPropagation();
                        changeSlide(newItem.id, 1);
                    };
                    nextButton.style.position = 'absolute';
                    nextButton.style.right = '0';
                    nextButton.style.top = '50%';
                    nextButton.style.transform = 'translateY(-50%)';
                    nextButton.style.background = 'rgba(0, 0, 0, 0.5)';
                    nextButton.style.color = 'white';
                    nextButton.style.border = 'none';
                    nextButton.style.cursor = 'pointer';

                    slideshowContainer.style.position = 'relative'; // Ensure the container is positioned
                    newItem.appendChild(slideshowContainer);
                    slideshowContainer.appendChild(prevButton); // Append buttons to the slideshow container
                    slideshowContainer.appendChild(nextButton);

                    storeItemsContainer.appendChild(newItem);
                }
            }
        )
        .catch(error => console.error('Error fetching images:', error));
        
}

function enlargeItem(item, imgSrc, upc) {
    const enlargedContainer = document.createElement('div');
    enlargedContainer.className = 'enlarged-container';
    enlargedContainer.style.position = 'fixed';
    enlargedContainer.style.top = '50%';
    enlargedContainer.style.left = '50%';
    enlargedContainer.style.transform = 'translate(-50%, -50%)';
    enlargedContainer.style.backgroundColor = 'white';
    enlargedContainer.style.padding = '20px';
    enlargedContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    enlargedContainer.style.zIndex = '100000';

    const enlargedImage = document.createElement('img');
    enlargedImage.src = imgSrc;
    enlargedImage.alt = 'Enlarged Product Image';
    enlargedImage.style.width = '300px';
    enlargedImage.style.height = '300px';

    const upcText = document.createElement('p');
    upcText.textContent = `UPC: ${upc}`;
    upcText.style.marginTop = '10px';

    const addToCartButton = document.createElement('button');
    addToCartButton.textContent = 'Add to Cart';
    addToCartButton.onclick = () => {
        addToCart(imgSrc);
        document.body.removeChild(enlargedContainer);
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginLeft = '10px';
    closeButton.onclick = () => {
        document.body.removeChild(enlargedContainer);
    };

    enlargedContainer.appendChild(enlargedImage);
    enlargedContainer.appendChild(upcText);
    enlargedContainer.appendChild(addToCartButton);
    enlargedContainer.appendChild(closeButton);

    document.body.appendChild(enlargedContainer);
}

function changeSlide(itemId, direction) {
    const item = document.getElementById(itemId);
    if (!item) return;

    const slides = item.querySelectorAll('.slide');
    let currentIndex = Array.from(slides).findIndex(slide => slide.style.display === 'block');

    slides[currentIndex].style.display = 'none';
    currentIndex = (currentIndex + direction + slides.length) % slides.length;
    slides[currentIndex].style.display = 'block';
}

function load_state(){
    update_hats();
    update_inventory();
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

function update_inventory(){
    console.log("Updating inventory...");
    let allInventory = [];
    const recursiveFetch = function fetch_inventory(offset=0) {
        fetch("/inventory?offset=" + offset)
            .then(response => response.json())
            .then(data => {
                console.log("Inventory data:", data.items);
                allInventory = allInventory.concat(data.items.map(item => ({
                    upc: item.item_upc_code,
                    quantity: item.item_total_quanity_on_hand,
                    isinactive: item.isinactive,
                })));
                console.log("Current inventory:", allInventory);
                if (data.hasMore) {
                    fetch_inventory(offset + data.items.length);
                } else {
                    // Store the full inventory array in localStorage as JSON
                    localStorage.setItem('inventory', JSON.stringify(allInventory));
                    console.log("Finished updating inventory. Inventory stored in localStorage.");
                }
            });
    };
    recursiveFetch();
}
