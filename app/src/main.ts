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
