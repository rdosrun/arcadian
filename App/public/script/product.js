function toggleCheckboxContainer() {
  const checkboxContainer = document.querySelector('.checkbox-container');
  checkboxContainer.classList.toggle('active');
}

function update_hats() {
  const selectedState = document.querySelector('input[name="state"]:checked').value;
  const storeItemsContainer = document.getElementById('store-items');
  storeItemsContainer.setAttribute('data-state', selectedState);

  fetch("/images/"+selectedState)
    .then(response => response.json())
    .then(data => {
      storeItemsContainer.innerHTML = ''; // Clear existing items
      data.forEach(item => {
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
        storeItemsContainer.appendChild(button);
      });
    })
    .catch(error => console.error('Error fetching images:', error));
}

