var total_hats = 50;
var curr_hats = 0;
var state = "";
function update_hats(){
    // Get the div containing the checkboxes
    const container = document.getElementById('checkbox-container');

    // Get all checkboxes within the div
    const checkboxes = container.querySelectorAll('input[type="radio"]');

    // Iterate through the checkboxes and log their status
    checkboxes.forEach(checkbox => {
        console.log(`${checkbox.value}: ${checkbox.checked ? 'Checked' : 'Unchecked'}`);
        if(checkbox.checked == true){
		fetch("/images/Hat_Pictures/"+checkbox.value+"/count.txt")
            .then((response) => response.text())
            .then((count) => {
                console.log(count,parseInt(count));
                curr_hats = parseInt(count);
                console.log(total_hats);
                state = checkbox.value;
                console.log(state);
            }).then(() => {duplicateElement();});
        }
        });

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
        if(i<curr_hats){
            var x = "/images/Hat_Pictures/"+state+"/"+i+".jpg";
            document.getElementById(i).querySelector("img").src = x;
            document.getElementById(i).style.display = "inline";
        }else{
            document.getElementById(i).style.display = "none";
        }
    }
    // Create 49 copies of the original element

}

