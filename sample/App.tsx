import { createComponent, useState, useEffect } from '../src/index';

// patch pour vite...
const React = { createElement: createComponent };

function App() {
  const date = new Date().toLocaleTimeString();
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    // on execute l'effect a chaque fois que count2 change donc toutes 1 seconde
    setTimeout(() => {
      setCount2(count2 + 1);
    }, 1000);
  }, [count2]);

  useEffect(() => {
    // on execute l'effect une seule fois
    setTimeout(() => {
      setCount3(count3 + 1);
    }, 1000);
  }, []);

  return (
    <div>
      <h1>Demo !</h1>
      <div>
        <h2>Mon futur compteur... {count2} - {count3} - {count}</h2>
        <p>Dernière mise à jour : {date}</p>
        <button onClick={() => setCount(count + 1)}>
          Incrementer {count}
        </button>

        // test input
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      </div>
    </div>
  );
}

export default App;