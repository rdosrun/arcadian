// JavaScript for handling photo uploads
function uploadPhoto() {
    const fileInput = document.getElementById('photo-upload');
    const formData = new FormData();
    formData.append('photo', fileInput.files[0]);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert('Photo uploaded successfully!');
        console.log(data);
    })
    .catch(error => {
        console.error('Error uploading photo:', error);
    });
}