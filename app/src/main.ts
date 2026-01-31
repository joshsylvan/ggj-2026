import './style.css'

import type { BuzzerState } from './types/buzz';
import * as soundSelectScene from './scenes/soundSelectScene';
import * as tutorialScene from './scenes/tutorialScene';
import { GAME_STATE_GAME, GAME_STATE_SOUND_SELECT, GAME_STATE_TUTORIAL, getGameState } from './state';


let canvas!: HTMLCanvasElement;
let ctx!: CanvasRenderingContext2D;
const container = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
container!.innerHTML = `
    <canvas id="canvas" width="640" height="360"></canvas>
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

  if (containerRatio > canvasRatio) {
    // Container is wider - fit to height
    canvas.style.width = 'auto';
    canvas.style.height = '100%';
  } else {
    // Container is taller - fit to width
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
  }
}

window.addEventListener('resize', resizeCanvas);




const render = (deltaTime: number, buzzState: BuzzerState[]) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (getGameState()) {
    case GAME_STATE_TUTORIAL:
      tutorialScene.render(deltaTime, buzzState, canvas, ctx);
      break;
    case GAME_STATE_SOUND_SELECT:
      soundSelectScene.render(
        deltaTime,
        buzzState,
        canvas,
        ctx
      );
      break;
    case GAME_STATE_GAME:
      break;
  }


};

const onUpdate = async () => {
  const now = Date.now();
  const deltaTime = (now - lastTime) / 1000.0;
  lastTime = now;

  const buzzState = await window.buzz.getState();
  // console.log(await window.buzz.getState());

  switch (getGameState()) {
    case GAME_STATE_TUTORIAL:
      tutorialScene.update(deltaTime);
      break;
    case GAME_STATE_SOUND_SELECT:
      soundSelectScene.update(deltaTime);
      break;
    case GAME_STATE_GAME:
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
    throw new Error("Failed to create canvas and context");
  }
  resizeCanvas();
  onUpdate()
});

function floydSteinbergBlocky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  {
    step = 16,
    blockSize = 2,
    maxError = 10
  } = {}
) {
  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;

  const idx = (x: number, y: number) => (y * width + x) * 4;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));

  for (let y = 0; y < height; y += blockSize) {
    const leftToRight = ((y / blockSize) % 2 === 0);

    let xStart = leftToRight ? 0 : width - blockSize;
    let xEnd   = leftToRight ? width : -blockSize;
    let xStep  = leftToRight ? blockSize : -blockSize;

    for (let x = xStart; x !== xEnd; x += xStep) {

      // average block color
      let avg = [0, 0, 0];
      let count = 0;

      for (let by = 0; by < blockSize; by++) {
        for (let bx = 0; bx < blockSize; bx++) {
          const px = x + bx;
          const py = y + by;
          if (px >= width || py >= height) continue;
          const i = idx(px, py);
          avg[0] += data[i];
          avg[1] += data[i + 1];
          avg[2] += data[i + 2];
          count++;
        }
      }

      for (let c = 0; c < 3; c++) {
        avg[c] /= count;
      }

      // quantize block
      let err = [0, 0, 0];
      for (let c = 0; c < 3; c++) {
        const q = Math.round(avg[c] / step) * step;
        err[c] = Math.max(-maxError, Math.min(maxError, avg[c] - q));

        // write quantized color to block
        for (let by = 0; by < blockSize; by++) {
          for (let bx = 0; bx < blockSize; bx++) {
            const px = x + bx;
            const py = y + by;
            if (px >= width || py >= height) continue;
            const i = idx(px, py);
            data[i + c] = clamp(q);
          }
        }
      }

      // diffuse error to neighboring blocks
      const spread = (dx: number, dy: number, weight: number) => {
        const nx = x + dx * blockSize;
        const ny = y + dy * blockSize;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return;

        for (let by = 0; by < blockSize; by++) {
          for (let bx = 0; bx < blockSize; bx++) {
            const px = nx + bx;
            const py = ny + by;
            if (px >= width || py >= height) continue;
            const i = idx(px, py);
            for (let c = 0; c < 3; c++) {
              data[i + c] = clamp(data[i + c] + err[c] * weight);
            }
          }
        }
      };

      if (leftToRight) {
        spread(1, 0, 7 / 16);
        spread(-1, 1, 3 / 16);
        spread(0, 1, 5 / 16);
        spread(1, 1, 1 / 16);
      } else {
        spread(-1, 0, 7 / 16);
        spread(1, 1, 3 / 16);
        spread(0, 1, 5 / 16);
        spread(-1, 1, 1 / 16);
      }
    }
  }

  ctx.putImageData(img, 0, 0);
}

