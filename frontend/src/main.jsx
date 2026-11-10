import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { auth } from './utils/config';
import { onAuthStateChanged } from 'firebase/auth';
import './styles/main.css';
import './styles/theme.css';

// Keep auth token synchronized across sessions
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const token = await user.getIdToken();
      localStorage.setItem('BlueBridge_token', token);
    } catch (e) {
      console.warn('Could not sync ID token:', e);
    }
  } else if (!localStorage.getItem('BlueBridge_user')) {
    localStorage.removeItem('BlueBridge_token');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
