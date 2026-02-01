import './style.css';

import type { BuzzerState } from './types/buzz';
import * as soundSelectScene from './scenes/soundSelectScene';
import * as tutorialScene from './scenes/tutorialScene';
import * as levelOneScene from './scenes/levelOneScene';
import * as resultsScene from './scenes/resultsScene';
import {
  GAME_STATE_GAME,
  GAME_STATE_RESULTS,
  GAME_STATE_SOUND_SELECT,
  GAME_STATE_TUTORIAL,
  getGameState,
  setGameState,
} from './state';
import { updateLedState } from './player-state';
import { setupMovie } from './moviePlayback';

let canvas!: HTMLCanvasElement;
let ctx!: CanvasRenderingContext2D;
const container = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
container!.innerHTML = `
    <canvas id="canvas" width="640" height="360"></canvas>
    <video id="video"></video>
`;

let lastTime = Date.now();

window.addEventListener('keydown', (event) => {
  window.buzz.onKeyDown(event.code);
});

window.addEventListener('keyup', (event) => {
  window.buzz.onKeyUp(event.code);
});

const resizeCanvas = () => {

  const containerRatio = container.clientWidth / container.clientHeight;
  const canvasRatio = canvas.width / canvas.height;

  const video = document.getElementById("video") as HTMLVideoElement;
  if (containerRatio > canvasRatio) {
    // Container is wider - fit to height
    canvas.style.width = 'auto';
    canvas.style.height = '100%';
    video.style.width = 'auto';
    video.style.height = '60%';
  } else {
    // Container is taller - fit to width
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    video.style.width = '60%';
    video.style.height = 'auto';
  }
};

window.addEventListener('resize', resizeCanvas);

const render = (deltaTime: number, buzzState: BuzzerState[]) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch (getGameState()) {
    case GAME_STATE_TUTORIAL:
      tutorialScene.render(buzzState, canvas, ctx);
      break;
    case GAME_STATE_SOUND_SELECT:
      soundSelectScene.render(deltaTime, buzzState, canvas, ctx);
      break;
    case GAME_STATE_GAME:
      levelOneScene.render(deltaTime, buzzState, canvas, ctx);
      break;
    case GAME_STATE_RESULTS:
      resultsScene.render(deltaTime, buzzState, canvas, ctx);
      break;
  }
};

const onUpdate = async () => {
  const now = Date.now();
  const deltaTime = (now - lastTime) / 1000.0;
  lastTime = now;

  const buzzState = await window.buzz.getState();
  updateLedState();

  switch (getGameState()) {
    case GAME_STATE_TUTORIAL:
      tutorialScene.update(deltaTime, buzzState);
      break;
    case GAME_STATE_SOUND_SELECT:
      soundSelectScene.update(deltaTime);
      break;
    case GAME_STATE_GAME:
      levelOneScene.update(deltaTime, buzzState);
      break;
    case GAME_STATE_RESULTS:
      resultsScene.update(deltaTime, buzzState);
      break;
  }

  render(deltaTime, buzzState);

  requestAnimationFrame(() => onUpdate());
};

requestAnimationFrame(() => {
  // Init heres
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.imageSmoothingEnabled = false;
  if (!canvas || !ctx) {
    throw new Error('Failed to create canvas and context');
  }

  setupMovie();
  setGameState(GAME_STATE_TUTORIAL);
  resizeCanvas();
  onUpdate();
});
