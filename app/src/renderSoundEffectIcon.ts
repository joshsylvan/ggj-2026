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
  ctx: CanvasRenderingContext2D
) => {
  ctx.font = '24px Minecraft';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.letterSpacing = '2px';
  ctx.fillText('Buzz to select your sound', Math.floor(x), Math.floor(y));
  ctx.font = '48px serif';
  ctx.fillText(soundEffect.emoji, Math.floor(x), Math.floor(y + 60));
  ctx.font = '24px Minecraft';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.letterSpacing = '2px';
  ctx.fillText(soundEffect.name, Math.floor(x), Math.floor(y + 100));
};
