import controllerImageSrc from './assets/sprites/controllers.png';
import type { SoundEffect } from './sound-effects';

export const controllerImageSrcWidth = 116;
export const controllerImageSrcHeight = 200;
const controllerImage = new Image();
controllerImage.src = controllerImageSrc;

export const drawSoundEffectToSelect = (
  x: number,
  y: number,
  soundEffect: SoundEffect,
  ctx: CanvasRenderingContext2D,
  countdown?: number
) => {
  ctx.textAlign = 'center';
  ctx.font = '48px serif';
  ctx.fillStyle = 'white';
  ctx.fillText(soundEffect.emoji, Math.floor(x), Math.floor(y));
  ctx.font = '24px Minecraft';
  ctx.letterSpacing = '2px';
  ctx.fillText(soundEffect.name, Math.floor(x), Math.floor(y + 50));
  if (countdown !== undefined && countdown > 0) {
    ctx.fillStyle = 'red';
    ctx.fillText(`Assigning randomly in ${countdown}...`, Math.floor(x), Math.floor(y + 90));
  } else {
    ctx.fillText('Buzz to claim your sound', Math.floor(x), Math.floor(y + 90));
  }
};

export const drawInstructionText = (
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  countdown?: number
) => {
  ctx.font = '24px Minecraft';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.letterSpacing = '2px';
  if (countdown !== undefined && countdown > 0) {
    ctx.fillText(`Claiming in ${countdown}...`, Math.floor(x), Math.floor(y + 90));
  } else {
    ctx.fillText('Buzz to claim your sound', Math.floor(x), Math.floor(y + 90));
  }
};
