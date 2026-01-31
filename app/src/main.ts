import './style.css';
import typescriptLogo from './typescript.svg';
import viteLogo from '/vite.svg';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;

window.addEventListener('keydown', (event) => {
  window.buzz.onKeyDown(event.code);
});

window.addEventListener('keyup', (event) => {
  window.buzz.onKeyUp(event.code);
});

const onUpdate = async () => {
  console.log(await window.buzz.getState());
  requestAnimationFrame(() => onUpdate());
};

requestAnimationFrame(() => onUpdate());
