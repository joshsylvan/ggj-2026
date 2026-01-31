import type { BuzzerState } from './types/buzz';
import controllerImageSrc from './assets/sprites/controllers.png';

export const controllerImageSrcWidth = 116;
export const controllerImageSrcHeight = 200;
const controllerImage = new Image();
controllerImage.src = controllerImageSrc;

export const drawController = (
  x: number,
  y: number,
  controllerState: BuzzerState,
  ctx: CanvasRenderingContext2D
) => {
  ctx.drawImage(
    controllerImage,
    0,
    0,
    controllerImageSrcWidth,
    controllerImageSrcHeight,
    Math.floor(x),
    Math.floor(y),
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
};

export type ButtonEmojis = {
  blue?: string;
  orange?: string;
  green?: string;
  yellow?: string;
};

// Button positions relative to controller (approximate centers)
const BUTTON_POSITIONS: Record<keyof ButtonEmojis, { x: number; y: number }> = {
  blue: { x: 58, y: 95 },
  orange: { x: 58, y: 120 },
  green: { x: 58, y: 145 },
  yellow: { x: 56, y: 170 },
};

export const drawControllerWithEmojis = (
  x: number,
  y: number,
  controllerState: BuzzerState,
  assignedCount: number,
  maxCount: number,
  buttonEmojis: ButtonEmojis,
  ctx: CanvasRenderingContext2D
) => {
  // Draw assigned count above controller
  ctx.save();
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = assignedCount < maxCount ? '#ffffff' : 'red';
  ctx.textAlign = 'center';
  if (assignedCount === maxCount) {
    ctx.fillText('READY', x + controllerImageSrcWidth / 2, y);
  }
  ctx.restore();

  drawController(x, y, controllerState, ctx);

  // Draw emojis above each button
  ctx.save();
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  (Object.keys(BUTTON_POSITIONS) as (keyof ButtonEmojis)[]).forEach((button) => {
    const emoji = buttonEmojis[button];
    if (emoji) {
      const pos = BUTTON_POSITIONS[button];
      ctx.fillText(emoji, x + pos.x, y + pos.y - 5);
    }
  });

  ctx.restore();
};
