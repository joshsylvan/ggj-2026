import './style.css'
import controllerImageSrc from './assets/sprites/controllers.png';
import type { BuzzerState } from './types/buzz';

const controllerImageSrcWidth = 116;
const controllerImageSrcHeight = 200;
const controllerImage = new Image();
controllerImage.src = controllerImageSrc;

const drawController = (x: number, y: number, controllerState: BuzzerState) => {
  ctx.drawImage(
    controllerImage,
    0,
    0,
    controllerImageSrcWidth,
    controllerImageSrcHeight,
    x,
    y,
    controllerImageSrcWidth,
    controllerImageSrcHeight
  );
  const valueOrder = ['buzz', 'blue', 'orange', 'green', 'yellow'];
  valueOrder.forEach((buttonName, index) => {
    if (controllerState[buttonName as keyof BuzzerState]) {
      ctx.drawImage(
        controllerImage,
        (index + 1) * controllerImageSrcWidth,
        0,
        controllerImageSrcWidth,
        controllerImageSrcHeight,
        x,
        y,
        controllerImageSrcWidth,
        controllerImageSrcHeight
      );
    }
  });
}

let canvas!: HTMLCanvasElement;
let ctx!: CanvasRenderingContext2D;
const container = document.querySelector<HTMLDivElement>('#app') as HTMLDivElement;
container!.innerHTML = `
    <canvas id="canvas" width="640" height="360"></canvas>
`;

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


let lastTime = Date.now();


const render = (deltaTime: number, buzzState: BuzzerState[]) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);


  // 1. Create gradient (x0, y0, x1, y1)
  const gradient = ctx.createLinearGradient(
    ((Math.sin((Date.now() / 1000)) + 1) / 2) * canvas.width,
    0,
    canvas.width,
    canvas.height
  );
  // 2. Add color stops (0.0 to 1.0)
  gradient.addColorStop(0, '#ee8695');
  gradient.addColorStop(1, '#fbbbad');
  // 3. Set fillStyle to gradient
  ctx.fillStyle = gradient;

  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // const time = Date.now();
  

  buzzState.forEach((state, index) => {
    let xWobble = Math.sin((Date.now() / 1000) + index) * 10;
    let yWobble = Math.cos((Date.now() / 1000) + index) * 10;

    drawController(xWobble + (90 + index * controllerImageSrcWidth), yWobble + 200, state);
  });
};


const onUpdate = async () => {
  const now = Date.now();
  const deltaTime = (now - lastTime) / 1000.0;
  lastTime = now;

  const buzzState = await window.buzz.getState();
  // console.log(await window.buzz.getState());
  render(deltaTime, buzzState);

  requestAnimationFrame(() => onUpdate());
};

requestAnimationFrame(() => {

  // Init heres
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
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

