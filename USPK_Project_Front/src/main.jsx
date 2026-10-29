import React from 'react';
import ReactDOM from 'react-dom/client';
import '../public/content/site.css';
import './Services/uspc-globe.js';
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);