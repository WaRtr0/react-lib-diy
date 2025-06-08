import { createComponent } from '../src/index';

// patch pour vite...
const React = { createElement: createComponent };

function App() {
  const date = new Date().toLocaleTimeString();

  return (
    <div>
      <h1>Demo !</h1>
      <div>
        <h2>Mon futur compteur...</h2>
        <p>Dernière mise à jour : {date}</p>
        <button>
          Incrementer
        </button>
      </div>
    </div>
  );
}

export default App;