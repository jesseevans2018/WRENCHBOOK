import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Register the service worker so WrenchBook can be installed and its app shell
// can open when the phone temporarily has no connection. AI lookups still need internet.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('WrenchBook service worker registration failed:', error);
    });
  });
}
