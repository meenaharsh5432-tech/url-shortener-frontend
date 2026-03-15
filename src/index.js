import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="703882985084-nrie5t6ihajfhgpprimuql4hfpvgm5jq.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);