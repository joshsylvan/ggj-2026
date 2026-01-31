import { getPlayerState, updateLedState } from '../player-state';
import { renderBackground } from '../renderBackground';
import {
  type ButtonEmojis,
  controllerImageSrcWidth,
  drawControllerWithEmojis,
} from '../renderControllers';
import { drawSoundEffectToSelect } from '../renderSoundEffectIcon';
import {
  getCurrentSoundEffect,
  getEmojiForSoundEffect,
  nextSoundEffect,
  playSoundEffect,
  playSoundEffectByName,
  type SoundEffect,
} from '../sound-effects';
import type { BuzzerState } from '../types/buzz';
import type { ButtonName } from '../state';

export const update = (deltaTime: number) => {};

let currentRenderedSoundEffect: SoundEffect | undefined = undefined;
let inputFrozenUntil: number = 0;

const isInputFrozen = (): boolean => {
  return Date.now() < inputFrozenUntil;
};

const freezeInput = (durationMs: number): void => {
  inputFrozenUntil = Date.now() + durationMs;
};

const renderSoundEffectToSelect = (ctx: CanvasRenderingContext2D) => {
  const currentSoundEffect = getCurrentSoundEffect();
  drawSoundEffectToSelect(300, 75, currentSoundEffect, ctx);
  if (currentRenderedSoundEffect === currentSoundEffect) return;
  currentRenderedSoundEffect = currentSoundEffect;
  playSoundEffect(currentSoundEffect);
};

export const render = async (
  deltaTime: number,
  buzzState: BuzzerState[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  renderBackground(canvas, ctx);

  renderSoundEffectToSelect(ctx);

  buzzState.forEach((state, index) => {
    const released = getPlayerState(index).hasReleasedBuzz(state.buzz);
    if (released && currentRenderedSoundEffect && !isInputFrozen()) {
      const assigned = getPlayerState(index).setSoundEffect(currentRenderedSoundEffect.name);
      if (assigned) {
        nextSoundEffect();
        freezeInput(2000);
      }
    }

    // Allow players to play their stored sounds when input is not frozen
    if (!isInputFrozen()) {
      const colorButtons: ButtonName[] = ['blue', 'orange', 'green', 'yellow'];
      colorButtons.forEach((button) => {
        const pressed = getPlayerState(index).hasButtonPressed(button, state[button]);
        if (pressed) {
          const soundName = getPlayerState(index).getSoundEffect(button);
          if (soundName) {
            playSoundEffectByName(soundName);
          }
        }
      });
    }
  });

  buzzState.forEach((state, index) => {
    const xWobble = Math.sin(Date.now() / 1000 + index) * 10;
    const yWobble = Math.cos(Date.now() / 1000 + index) * 10;
    const xPos = xWobble + (90 + index * controllerImageSrcWidth);
    const yPos = yWobble + 200;

    const remaining = getPlayerState(index).getRemainingSlots();
    const assigned = 4 - remaining;

    const playerState = getPlayerState(index);
    const buttonEmojis: ButtonEmojis = {
      blue: getEmojiForSoundEffect(playerState.getSoundEffect('blue') ?? ''),
      orange: getEmojiForSoundEffect(playerState.getSoundEffect('orange') ?? ''),
      green: getEmojiForSoundEffect(playerState.getSoundEffect('green') ?? ''),
      yellow: getEmojiForSoundEffect(playerState.getSoundEffect('yellow') ?? ''),
    };

    drawControllerWithEmojis(xPos, yPos, state, assigned, 4, buttonEmojis, ctx);
  });
};
