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

                    const slideshowContainer = document.createElement('div');
                    slideshowContainer.className = 'slideshow-container';

                    item.imageUrls.slice(0, 4).forEach((imageUrl, index) => {
                        const slide = document.createElement('div');
                        slide.className = 'slide';
                        slide.style.display = index === 0 ? 'block' : 'none'; // Show the first image by default

                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.alt = `Item ${item.id} - Slide ${index + 1}`;

                        slide.appendChild(img);
                        slideshowContainer.appendChild(slide);
                    });

                    let currentSlideIndex = 0;
                    setInterval(() => {
                        const slides = slideshowContainer.querySelectorAll('.slide');
                        slides[currentSlideIndex].style.display = 'none';
                        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
                        slides[currentSlideIndex].style.display = 'block';
                    }, 3000); // Change slide every 3 seconds

                    const priceDiv = document.createElement('div');
                    priceDiv.className = 'price';
                    priceDiv.textContent = `$${item.price}`;

                    button.appendChild(slideshowContainer);
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

