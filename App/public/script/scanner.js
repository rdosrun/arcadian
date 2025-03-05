function StartScanner(){
    const startScanButton = document.getElementById('start-scan');
        const scannerContainer = document.getElementById('scanner-container');

        startScanButton.addEventListener('click', () => {
            scannerContainer.style.display = 'block';
            startScanButton.style.display = 'none';

            Quagga.init(
                {
                    inputStream: {
                        name: "Live",
                        type: "LiveStream",
                        target: scannerContainer, // Use the #scanner-container div
                    },
                    decoder: {
                        readers: ["code_128_reader", "ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"], // Add more if needed
                    },
                },
                function (err) {
                    if (err) {
                        console.error(err);
                        alert("Error initializing Quagga. Please check your camera settings.");
                        scannerContainer.style.display = 'none';
                        startScanButton.style.display = 'block';
                        return;
                    }
                    console.log("Initialization finished. Ready to start");
                    Quagga.start();
                }
            );

            Quagga.onDetected((data) => {
                console.log("Barcode detected: ", data.codeResult.code);
                alert(`Barcode detected: ${data.codeResult.code}`);
                stopScanner();
            });
        });
}

function stopScanner() {
            const startScanButton = document.getElementById('start-scan');
            const scannerContainer = document.getElementById('scanner-container');
            Quagga.stop();
            scannerContainer.style.display = 'none';
            startScanButton.style.display = 'block';
}
