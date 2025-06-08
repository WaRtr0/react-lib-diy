import { render, createComponent } from '../src';
import App from './App';

// patch pour vite...
const React = { createElement: createComponent };

function renderApp() {
  const root = document.getElementById('app');
  if (root) {
    render(<App />, root);
    console.log('Application rendue à', new Date().toLocaleTimeString());
  } else {
    console.error("Élément #app non trouvé");
  }
}

renderApp();

// Support du Hot Module
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.location.reload();
  });

  import.meta.hot.accept();
}