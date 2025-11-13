import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <-- O .tsx não é obrigatório aqui, está certo
import './index.css'; // <-- 1. ADICIONE ESTA LINHA!

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
