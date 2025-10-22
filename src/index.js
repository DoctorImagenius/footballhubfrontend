import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FootballProvider } from './FootballContext';
import BackgroundAnim from './comp/BackgroundAnim';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <FootballProvider>
      <BackgroundAnim />
      <App />
    </FootballProvider>
  </React.StrictMode>
);

reportWebVitals();
