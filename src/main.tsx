import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CarProvider } from './context/CarContext';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <CarProvider>
        <App />
      </CarProvider>
    </BrowserRouter>
  </React.StrictMode>
);
