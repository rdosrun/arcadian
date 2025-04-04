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
                for (var i = 0; i < data.length; i = i + 4) {
                    const imgSrcs = [
                        data[i]?.imageUrl,
                        data[i + 1]?.imageUrl,
                        data[i + 2]?.imageUrl,
                        data[i + 3]?.imageUrl
                    ].filter(src => src); // Filter out undefined values

                    const newItem = document.createElement('button');
                    newItem.className = 'item';
                    newItem.id = i + 1;

                    // Add click event to call addToCart
                    newItem.onclick = () => {
                        addToCart(imgSrcs[0]);
                    };

                    // Create a container for the slideshow
                    const slideshowContainer = document.createElement('div');
                    slideshowContainer.className = 'slideshow-container';

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
                    prevButton.onclick = () => changeSlide(newItem.id, -1);
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
                    nextButton.onclick = () => changeSlide(newItem.id, 1);
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

