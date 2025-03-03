import React, { useState } from 'react';

const ReOrder = () => {
  const [scanResult, setScanResult] = useState('');
  const [storeId, setStoreId] = useState('');
  const [productId, setProductId] = useState('');

  const startScan = () => {
    // Implement scan functionality
  };

  const addToCartManual = () => {
    // Implement add to cart functionality
  };

  return (
    <div className="main-page">
      <div className="container">
        <h1>Scan BarCodes</h1>
        <div id="camera-container">
          <button id="start-scan" onClick={startScan}>Start Scan</button>
          <div id="scanner-container"></div>
        </div>
        <div id="result">{scanResult}</div>
        <div className="section">
          <div className="manual">
            <h1>Manual Re-Order</h1>
            <label htmlFor="store_id">Store ID:</label>
            <input type="number" id="store_id" value={storeId} onChange={(e) => setStoreId(e.target.value)} />
            <label htmlFor="product_id">Product ID:</label>
            <input type="number" id="product_id" value={productId} onChange={(e) => setProductId(e.target.value)} />
            <button onClick={addToCartManual} id="manual-btn">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReOrder;
