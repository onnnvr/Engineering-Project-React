import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import MenuContext from './Context/MenuContext';
import WindowContext from './Context/WindowContext';
import 'react-loading-skeleton/dist/skeleton.css';
import "react-image-gallery/styles/css/image-gallery.css";
import AuthProvider from './Context/AuthContext';
import './i18n';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <WindowContext>
        <MenuContext>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MenuContext>
      </WindowContext>
    </AuthProvider>
  </React.StrictMode>
);


